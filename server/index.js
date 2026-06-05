import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Only load .env file in local development - in production (Vercel), env vars come from dashboard
if (process.env.NODE_ENV !== 'production') {
  const result = dotenv.config({
    path: path.join(__dirname, '..', '.env'),
    override: true
  });
  if (result.error) {
    console.error('❌ Failed to load .env:', result.error);
  } else {
    console.log('✅ Loaded .env for local development');
  }
}

import { Product } from './models/Product.js';
import { Category } from './models/Category.js';
import { Cart } from './models/Cart.js';
import { Order } from './models/Order.js';
import { User } from './models/User.js';
import { sendWhatsAppMessage } from './services/whatsappService.js';
import { generateToken } from './utils/jwt.js';
import { VerificationToken } from './models/VerificationToken.js';
import { requireAuth } from './middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =====================
// MONGODB CONNECTION (cached for serverless)
// =====================
let mongoConnected = false;

const connectDB = async () => {
  if (mongoConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME || 'RichGirl_Test',
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    mongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    throw err;
  }
};

// Run DB connection + seeding once on startup (for local dev)
// In serverless (Vercel), connectDB is called per-request via middleware
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(async () => {
    // Seed default users and categories in local dev
    await seedInitialData();
  }).catch(err => console.error('❌ MongoDB Connection Error:', err));
}

// Middleware to ensure DB is connected on every request (serverless-safe)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Database connection failed', error: err.message });
  }
});

// Seed function (called on local startup or lazily in production)
async function seedInitialData() {
  try {
    const customerEmail = 'customer@example.com';
    const existingCustomer = await User.findOne({ email: customerEmail });
    if (!existingCustomer) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('mockpassword123', salt);
      const defaultCustomer = new User({
        name: 'Default Customer',
        email: customerEmail,
        password: hashedPassword,
        phone: '9999988888',
        isAdmin: false,
        isVerified: true
      });
      await defaultCustomer.save();

      const defaultCart = new Cart({ userId: defaultCustomer._id, items: [] });
      await defaultCart.save();
      console.log('🎉 Default customer customer@example.com seeded successfully.');
    }

    // Seed Admin User
    const adminEmail = 'admin@richgirl.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const adminHashedPassword = await bcrypt.hash('adminpassword123', salt);
      const defaultAdmin = new User({
        name: 'RichGirl Admin',
        email: adminEmail,
        password: adminHashedPassword,
        phone: '0000000000',
        isAdmin: true,
        isVerified: true
      });
      await defaultAdmin.save();
      console.log('👑 Admin user admin@richgirl.com seeded successfully.');
    }
    // Seed Categories (synchronized with seedCategories.js)
    const categoriesToSeed = [
      { name: '3 Piece Dress', type: 'indian', image: '/assets/3PieceDress.jpg' },
      { name: '2 Piece Dress', type: 'indian', image: '/assets/2PieceDress.jpg' },
      { name: 'Kurtis', type: 'indian', image: '/assets/kurti.jpg' },
      { name: 'Tunics', type: 'western', image: '/assets/tunic.jpg' },
      { name: 'Tops', type: 'western', image: '/assets/top.jpg' },
      { name: 'Shirts', type: 'western', image: '/assets/shirt.jpg' },
      { name: 'Jumpsuits', type: 'western', image: '/assets/jumpsuit.jpg' },
      { name: 'Jeans', type: 'western', image: '/assets/jeans.jpg' },
      { name: 'Cord Sets-Western', type: 'western', image: '/assets/westernCordSet.jpg' },
      { name: 'Cord Sets-Indian', type: 'indian', image: '/assets/indianCordSet.jpg' },
      { name: 'Western Dresses', type: 'western', image: '/assets/westernDress.jpg' },
      { name: 'Skirts', type: 'western', image: '/assets/skirt.jpg' },
      { name: 'T-shirts', type: 'western', image: '/assets/tshirt.jpg' },
      { name: 'Shorts', type: 'western', image: '/assets/shorts.jpg' },
      { name: 'Pants', type: 'western', image: '/assets/pants.jpg' }
    ];
    for (const cat of categoriesToSeed) {
      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await Category.findOneAndUpdate(
        { slug },
        {
          name: cat.name,
          slug,
          type: cat.type || 'western',
          image: cat.image,
          displayOrder: 10
        },
        { upsert: true }
      );
    }
    console.log('✅ Categories synchronized successfully');
  } catch (err) {
    console.error('Error seeding data on startup:', err);
  }
}

// =======================
// ROUTES
// =======================

// --- Products ---
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category) {
      // If category is a slug, we might need to find the category first
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // Fallback to categoryName
        query.categoryName = { $regex: new RegExp(category, 'i') };
      }
    }

    const products = await Product.find(query);
    // Map _id to id and images[0] to image for frontend compatibility
    const formattedProducts = products.map(p => ({
      ...p.toObject(),
      id: p._id.toString(),
      image: p.images?.[0] || ''
    }));

    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json({
        ...product.toObject(),
        id: product._id.toString(),
        image: product.images?.[0] || ''
      });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Admin AI Description Generator ---
app.post('/api/admin/generate-description', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: 'Image URL is required' });

    const apiKey = (process.env.OPEN_ROUTER_KEY || process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey || apiKey.length < 10) {
      return res.status(400).json({ message: 'API key not configured. Please set OPEN_ROUTER_KEY or GEMINI_API_KEY in root/.env' });
    }

    // Fetch image as base64 using native fetch
    const imageResponse = await fetch(image);
    if (!imageResponse.ok) {
      return res.status(400).json({ message: 'Failed to fetch the product image. Make sure image is uploaded first.' });
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const base64Image = imageBuffer.toString('base64');
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const cleanKey = apiKey.startsWith('AQ.') && apiKey.includes('sk-or-') ? apiKey.substring(3) : apiKey;

    // Check if it's an OpenRouter key
    if (cleanKey.startsWith('sk-or-')) {
      console.log('Using OpenRouter for AI generation...');

      const generateWithModel = async (modelName) => {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${cleanKey}`,
            "HTTP-Referer": "https://sublimecare.com.au",
            "X-Title": "PRISM Test",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": modelName,
            "messages": [
              {
                "role": "user",
                "content": [
                  {
                    "type": "text",
                    "text": "You are a senior fashion copywriter for a high-end indian brand. Generate a detailed, lush, and storytelling-style e-commerce product description for 'RichGirl'. \n\nYour task:\n1. Describe the garment's visual appeal, fabric texture, and flow.\n2. Detail the specific design elements (neckline, embroidery, print, sleeve style).\n3. Suggest an occasion where this would be the perfect statement piece.\n4. Use evocative, sensory language to make the customer feel the quality.\n\nThe description should be substantial (at least 3-4 professional paragraphs) and approximately 200-250 words. Do NOT provide short summary captions. Return ONLY the description text with specifics highlighted in bullet points."
                  },
                  {
                    "type": "image_url",
                    "image_url": {
                      "url": `data:${contentType};base64,${base64Image}`
                    }
                  }
                ]
              }
            ],
            "max_tokens": 1000,
            "temperature": 0.7
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(`OpenRouter Error (${modelName}): ${data.error?.message || response.statusText}`);
        }
        return data.choices[0].message.content;
      };

      const primaryModel = "google/gemma-4-31b-it:free";
      const maxRetries = 3;
      let lastError = null;

      for (let i = 0; i < maxRetries; i++) {
        try {
          console.log(`Attempting generation with ${primaryModel} (Attempt ${i + 1}/${maxRetries})...`);
          const description = await generateWithModel(primaryModel);
          return res.json({ description });
        } catch (err) {
          lastError = err;
          console.warn(`${primaryModel} failed on attempt ${i + 1}: ${err.message}`);
          if (i < maxRetries - 1) {
            console.log(`Retrying in ${Math.pow(2, i)}s...`);
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          }
        }
      }

      // Final fallback to openrouter/free if primary model fails after retries
      console.warn('Primary model failed all retries, trying openrouter/free as final fallback...');
      try {
        const description = await generateWithModel("openrouter/free");
        return res.json({ description });
      } catch (fallbackErr) {
        console.error(`AI generation failed completely: ${fallbackErr.message}`);
        return res.status(500).json({ message: 'AI generation failed after multiple retries. Please try again in a few moments.', error: fallbackErr.message });
      }
    }
    else {
      // Standard Google AI Studio SDK fallback
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = "You are an indian fashion copywriter for 'RichGirl', a premium ethnic/western fusion brand. Describe this clothing product for the e-commerce website. Focus on fabric, style, embroidery/print details, and occasion. Make it elegant, premium and appealing. Keep it under 100 words. Return ONLY the description text, no headings or bullet points.";

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: contentType,
          },
        },
      ]);
      res.json({ description: result.response.text() });
    }
  } catch (error) {
    console.error('AI error detailed:', error);
    const errorMsg = error.message || 'Unknown AI error';
    res.status(500).json({ message: `AI generation failed: ${errorMsg}` });
  }
});


// --- Categories API ---
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Cart ---
// Get Cart for User
app.get('/api/cart/:userId', requireAuth, async (req, res) => {
  try {
    if (req.user.id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.productId');
    if (!cart) {
      return res.json({ items: [] });
    }
    // Format items for frontend
    const formattedItems = cart.items.map(item => ({
      id: item.productId._id || item.productId,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice || item.price,
      image: item.image,
      size: item.size,
      color: item.color,
      quantity: item.quantity
    }));
    res.json({ items: formattedItems });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add to Cart / Update Cart
app.post('/api/cart', requireAuth, async (req, res) => {
  try {
    const { userId, productId, name, image, size, color, quantity, price, originalPrice } = req.body;

    if (req.user.id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        items: [{ productId, name, image, size, color, quantity, price, originalPrice }]
      });
    } else {
      // Check if item exists (same product, size, and color)
      const itemIndex = cart.items.findIndex(p =>
        p.productId.toString() === productId && p.size === size && p.color === color
      );

      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ productId, name, image, size, color, quantity, price, originalPrice });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update item quantity
app.put('/api/cart/:userId/:productId', requireAuth, async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity, size, color } = req.body;

    if (req.user.id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(p =>
      p.productId.toString() === productId && p.size === size && p.color === color
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove item from cart
app.delete('/api/cart/:userId/:productId', requireAuth, async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { size, color } = req.query; // pass size/color in query to uniquely identify

    if (req.user.id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(p =>
      !(p.productId.toString() === productId && p.size === size && p.color === color)
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Merge Guest Cart with User Cart
app.post('/api/cart/merge', requireAuth, async (req, res) => {
  try {
    const { userId, items } = req.body;
    if (req.user.id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Merge logic: sum quantities for same items, else push new
    for (const item of items) {
      const existingIndex = cart.items.findIndex(i =>
        i.productId.toString() === item.productId &&
        i.size === item.size &&
        i.color === item.color
      );
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += item.quantity;
      } else {
        cart.items.push(item);
      }
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- User Addresses ---
app.get('/api/users/addresses', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/users/addresses', requireAuth, async (req, res) => {
  try {
    const { address } = req.body;
    const user = await User.findById(req.user.id);

    // If setting as default, clear others
    if (address.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    user.addresses.push(address);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/users/addresses/:addressId', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Orders ---
// Get user's own orders
app.get('/api/orders/user/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const { userId, products, totalAmount, discount, deliveryCharge, shippingAddress, payment } = req.body;

    if (req.user.id.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const newOrder = new Order({
      orderId: 'RG-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
      userId,
      products,
      totalAmount,
      discount,
      deliveryCharge,
      shippingAddress,
      payment
    });

    await newOrder.save();

    // Clear the user's cart
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Users (Real Login/Auth) ---
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    // Handle both hashed and plain passwords for legacy users
    let isMatch = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    // Generate JWT token
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, isVerified: user.isVerified } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      isVerified: false
    });

    await newUser.save();

    // Auto-create cart for new user
    const newCart = new Cart({
      userId: newUser._id,
      items: []
    });
    await newCart.save();

    // Create verification token (valid 24h)
    const verificationToken = generateToken(newUser); // reuse JWT for simplicity
    const tokenDoc = new VerificationToken({
      userId: newUser._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      type: 'verify'
    });
    await tokenDoc.save();
    console.log('Verification link (console):', `http://localhost:5173/verify?token=${verificationToken}`);

    res.status(201).json({ id: newUser._id, name: newUser.name, email: newUser.email, isAdmin: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Verification & Password Reset Routes ---
app.get('/api/users/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Verification token is required' });

    const tokenDoc = await VerificationToken.findOne({ token, type: 'verify' });
    if (!tokenDoc) return res.status(400).json({ message: 'Invalid or expired verification token' });

    if (tokenDoc.expiresAt < new Date()) {
      await VerificationToken.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ message: 'Verification token has expired' });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(400).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ _id: tokenDoc._id });

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/users/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if user doesn't exist
      return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    // Generate password reset token (valid 1 hour)
    const resetToken = generateToken(user);
    const tokenDoc = new VerificationToken({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      type: 'reset'
    });
    await tokenDoc.save();

    console.log('Password reset link (console):', `http://localhost:5173/reset-password?token=${resetToken}`);

    res.json({ message: 'If an account exists with this email, a reset link has been logged to the console.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/users/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required' });

    const tokenDoc = await VerificationToken.findOne({ token, type: 'reset' });
    if (!tokenDoc) return res.status(400).json({ message: 'Invalid or expired reset token' });

    if (tokenDoc.expiresAt < new Date()) {
      await VerificationToken.deleteOne({ _id: tokenDoc._id });
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    await VerificationToken.deleteOne({ _id: tokenDoc._id });

    res.json({ message: 'Password has been reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Payments ---
app.post('/api/payment/create-order', requireAuth, async (req, res) => {
  try {
    const { amount } = req.body; // In INR
    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
});

app.post('/api/payment/verify', requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, message: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Verification error', error: error.message });
  }
});


// --- Admin ---
app.get('/api/admin/stats', requireAuth, async (req, res) => {
  // Only admin can access
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const totalProducts = await Product.countDocuments();
    const lowStock = await Product.countDocuments({ inStock: false });

    const orders = await Order.find();
    const activeOrders = orders.filter(o => o.status !== 'Delivered').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({ totalProducts, lowStock, activeOrders, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/admin/orders', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    const formatted = orders.map(o => ({
      ...o.toObject(),
      id: o._id,
      userName: o.userId?.name || 'Guest',
      userEmail: o.userId?.email || 'N/A'
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/admin/users', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const formatted = users.map(u => ({ ...u.toObject(), id: u._id }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Config Endpoint (Cloudinary & Razorpay) ---
app.get('/api/config', (req, res) => {
  res.json({
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'richgirl_preset',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || ''
  });
});

// --- Product Creation (Admin) ---
app.post('/api/products', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { name, description, category, price, discount, fabric, colors, sizes, image, type } = req.body;

    // Find or create category
    let categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
    if (!categoryDoc) {
      const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      categoryDoc = new Category({
        name: category,
        slug,
        type: type || 'western',
        displayOrder: 10
      });
      await categoryDoc.save();
    }

    const formattedSizes = sizes.map(s => {
      // s is { size: 'S', variants: [{ color: 'Pink', stock: 10 }, ...] }
      return {
        size: s.size,
        variants: s.variants.map(v => ({
          color: v.color,
          colorLabel: v.colorLabel || v.color,
          stock: Number(v.stock) || 0
        }))
      };
    });

    // Calculate total stock from variants
    const totalStock = formattedSizes.reduce((acc, s) => {
      const sizeStock = s.variants.reduce((sAcc, v) => sAcc + v.stock, 0);
      return acc + sizeStock;
    }, 0);

    const inStock = totalStock > 0;

    // Selling price = Original - Discount
    // Wait, the user said: "THE PRICE SHOULD BE WRITTEN BY USER, THE DISCOUNT PERCENT FIELD SHOULD BE SELECT ONE OPTIONS... BASED ON THISTHE DISCOUNTED RATE SHOULD BE SHOWN ON THE NET PRICE."
    // So Price = MRP, Discount% = percentage.
    // Price from frontend will be MRP.
    const mrp = Number(price);
    const discountPercent = Number(discount) || 0;
    const sellingPrice = Math.round(mrp * (1 - discountPercent / 100));
    const discountAmount = mrp - sellingPrice;

    const newProduct = new Product({
      name,
      description,
      category: categoryDoc._id,
      categoryName: categoryDoc.name,
      type: type || 'western',
      price: sellingPrice,
      originalPrice: mrp,
      discountPrice: discountAmount,
      discount: discountPercent,
      fabric: fabric || 'Cotton',
      images: [image],
      colors: colors || [],
      sizes: formattedSizes,
      inStock,
      totalStock,
      isActive: true
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Product (Admin)
app.put('/api/products/:id', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { name, description, category, price, discount, fabric, colors, sizes, image, type } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Handle Category
    let categoryDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
    if (!categoryDoc) {
      const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      categoryDoc = new Category({ name: category, slug, type: type || 'western', displayOrder: 10 });
      await categoryDoc.save();
    }

    const formattedSizes = sizes.map(s => ({
      size: s.size,
      variants: s.variants.map(v => ({
        color: v.color,
        colorLabel: v.colorLabel || v.color,
        stock: Number(v.stock) || 0
      }))
    }));

    const totalStock = formattedSizes.reduce((acc, s) => acc + s.variants.reduce((sAcc, v) => sAcc + v.stock, 0), 0);
    const inStock = totalStock > 0;
    const mrp = Number(price);
    const discountPercent = Number(discount) || 0;
    const sellingPrice = Math.round(mrp * (1 - discountPercent / 100));

    product.name = name;
    product.description = description;
    product.category = categoryDoc._id;
    product.categoryName = categoryDoc.name;
    product.price = sellingPrice;
    product.originalPrice = mrp;
    product.discount = discountPercent;
    product.discountPrice = mrp - sellingPrice;
    product.fabric = fabric;
    product.sizes = formattedSizes;
    if (image) product.images = [image];
    product.type = type;
    product.totalStock = totalStock;
    product.inStock = inStock;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Product (Admin)
app.delete('/api/products/:id', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Admin Order Update ---
app.put('/api/admin/orders/:id', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { shippingStatus, trackingId, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (shippingStatus) order.shippingStatus = shippingStatus;
    if (trackingId) order.trackingId = trackingId;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    if (shippingStatus === 'Delivered') {
      order.deliveredAt = new Date();
      order.payment.status = 'paid'; // Automatically paid on delivery
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Courier Delivery Tracking API ---
app.get('/api/orders/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Mock tracking timeline details based on status
    const timeline = [];
    const statusOrder = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIdx = statusOrder.indexOf(order.shippingStatus);

    const dates = {
      Processing: order.createdAt,
      Confirmed: new Date(new Date(order.createdAt).getTime() + 12 * 60 * 60 * 1000), // +12 hours
      Shipped: new Date(new Date(order.createdAt).getTime() + 36 * 60 * 60 * 1000), // +1.5 days
      'Out for Delivery': new Date(new Date(order.createdAt).getTime() + 60 * 60 * 1000 * 2.5 * 24), // +2.5 days
      Delivered: order.deliveredAt || new Date(new Date(order.createdAt).getTime() + 60 * 60 * 1000 * 3 * 24) // +3 days
    };

    statusOrder.forEach((status, idx) => {
      timeline.push({
        status,
        completed: idx <= currentIdx,
        date: idx <= currentIdx ? dates[status] : null,
        description: getStatusDescription(status, order.trackingId)
      });
    });

    res.json({
      orderId: order.orderId,
      shippingStatus: order.shippingStatus,
      trackingId: order.trackingId,
      estimatedDelivery: order.estimatedDelivery,
      shippingAddress: order.shippingAddress,
      timeline
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Category List ---
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


function getStatusDescription(status, trackingId) {
  switch (status) {
    case 'Processing': return 'We have received your order and are preparing it.';
    case 'Confirmed': return 'Your order has been verified and confirmed.';
    case 'Shipped': return trackingId ? `Handed over to FastCourier local delivery. Tracking ID: ${trackingId}` : 'Your package has left our fulfillment center.';
    case 'Out for Delivery': return 'FastCourier courier agent is on the way to your delivery address.';
    case 'Delivered': return 'Package delivered successfully.';
    default: return '';
  }
}

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
