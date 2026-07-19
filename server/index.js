import express from 'express';
import Razorpay from 'razorpay';
import multer from 'multer';
import ExcelJS from 'exceljs';
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
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Shiprocket Template Constants
const SHIPROCKET_COLUMNS = [
  { key: "orderId", header: "*Order Id" },
  { key: "orderDate", header: "Order Date (DD-MM-YYYY) (Optional)" },
  { key: "verified", header: "Verified Order (Yes/No) (Optional)" },
  { key: "mobile", header: "*Buyer's Mobile No." },
  { key: "firstName", header: "*Buyer's First Name" },
  { key: "lastName", header: "Buyer's Last Name (Optional)" },
  { key: "shipAddress", header: "*Shipping Complete Address" },
  { key: "landmark", header: "Shipping Address Landmark (Optional)" },
  { key: "pincode", header: "*Shipping Address Pincode" },
  { key: "city", header: "*Shipping Address City" },
  { key: "state", header: "*Shipping Address State" },
  { key: "country", header: "*Shipping Address Country" },
  { key: "email", header: "Email (Optional)" },
  { key: "altMobile", header: "Buyer's Alternate Mobile Number (Optional)" },
  { key: "companyName", header: "Buyer's Company Name (Optional)" },
  { key: "gstin", header: "Buyer's GSTIN (Optional)" },
  { key: "billAddress", header: "Billing Complete Address (Optional)" },
  { key: "billLandmark", header: "Billing Landmark (Optional)" },
  { key: "billPincode", header: "Billing Pincode (Optional)" },
  { key: "billCity", header: "Billing City (Optional)" },
  { key: "billState", header: "Billing State (Optional)" },
  { key: "billCountry", header: "Billing Country (Optional)" },
  { key: "notify", header: "Send Notification (Yes/No) (Optional)" },
  { key: "pickupId", header: "Pickup Address Id (Optional)" },
  { key: "channel", header: "*Order Channel" },
  { key: "payment", header: "*Payment Method (COD/Prepaid)" },
  { key: "productName", header: "*Product Name" },
  { key: "sku", header: "*Master SKU" },
  { key: "qty", header: "*Product Quantity" },
  { key: "price", header: "*Per Unit Price in INR (Inclusive of Tax)" },
  { key: "partialCOD", header: "*Partial COD (Yes/No)" },
  { key: "paidAmount", header: "Paid Amount (Rs.)" },
  { key: "productDisc", header: "Product Discount (Per Unit Item) (Optional)" },
  { key: "coupon", header: "Coupon (Optional)" },
  { key: "hsn", header: "HSN Code (Optional)" },
  { key: "taxRate", header: "Tax Rate(percentage) (Optional)" },
  { key: "shippingChg", header: "Shipping Charges (Per Order) (Optional)" },
  { key: "giftWrapChg", header: "Gift Wrap Charges (Per Order) (Optional)" },
  { key: "txnFee", header: "Transaction Fee (Per Order) (Optional)" },
  { key: "totalDisc", header: "Total Discount (Per Order) (Optional)" },
  { key: "orderTag", header: "Order Tag (Optional)" },
  { key: "containsDocs", header: "*Contain Documents (Yes/No)" },
  { key: "reseller", header: "Reseller Name (Optional)" },
  { key: "weight", header: "*Weight Of Shipment (kg)" },
  { key: "length", header: "*Length (cm)" },
  { key: "breadth", header: "*Breadth (cm)" },
  { key: "height", header: "*Height (cm)" },
  { key: "packageCount", header: "Package Count (Optional)" },
  { key: "courierId", header: "Courier ID (Optional)" },
];

const SHIPROCKET_GROUPS = [
  { start: 1, end: 3, label: "", fill: "FFFFFFFF" },
  { start: 4, end: 23, label: "Buyer's Details", fill: "FFF4FFE0" },
  { start: 24, end: 24, label: "Pickup Details", fill: "FFFFF4F4" },
  { start: 25, end: 43, label: "Order Details", fill: "FFD7EDFF" },
  { start: 44, end: 48, label: "Package Details", fill: "FFE4FFF3" },
  { start: 49, end: 49, label: "Courier Details", fill: "FFFFF1C7" },
];

let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } else {
    console.warn("⚠️ Razorpay keys are not configured. Payments will be unavailable.");
  }
} catch (error) {
  console.error("❌ Failed to initialize Razorpay:", error.message);
}

// =====================
// MONGODB CONNECTION (cached for serverless)
// =====================
let mongoConnected = false;

const connectDB = async () => {
  if (mongoConnected && mongoose.connection.readyState === 1) return;
  try {
    const uri = process.env.MONGO_URI
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    mongoConnected = true;
    console.log(`✅ Connected to MongoDB Atlas.`);
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
        role: 'customer',
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
        role: 'admin',
        isVerified: true
      });
      await defaultAdmin.save();
      console.log('👑 Admin user admin@richgirl.com seeded successfully.');
    }

    // Seed Employee User
    const employeeEmail = 'employee@richgirl.com';
    const existingEmployee = await User.findOne({ email: employeeEmail });
    if (!existingEmployee) {
      const salt = await bcrypt.genSalt(10);
      const employeeHashedPassword = await bcrypt.hash('employeepassword123', salt);
      const defaultEmployee = new User({
        name: 'RichGirl Employee',
        email: employeeEmail,
        password: employeeHashedPassword,
        phone: '1111111111',
        isAdmin: false,
        role: 'employee',
        isVerified: true
      });
      await defaultEmployee.save();
      console.log('👷 Employee user employee@richgirl.com seeded successfully.');
    }
    // Seed Categories (synchronized with seedCategories.js)
    // Only seed if there are no active categories in the database to prevent deactivating them on cold starts
    const activeCategoryCount = await Category.countDocuments({ isActive: true });
    if (activeCategoryCount === 0) {
      console.log('No categories found. Seeding initial categories...');
      const categoriesToSeed = [
        { name: '3-Piece Suits', type: 'indian', slug: '3-piece-suits', image: '/assets/3PieceDress.jpg' },
        { name: 'Cord sets', type: 'indian', slug: 'cord-sets-indian', image: '/assets/indianCordSet.jpg' },
        { name: 'Tunics', type: 'indian', slug: 'tunics-indian', image: '/assets/tunic.jpg' },
        { name: 'Kurtis', type: 'indian', slug: 'kurtis', image: '/assets/kurti.jpg' },
        
        { name: 'Tops', type: 'western', slug: 'tops-western', image: '/assets/top.jpg' },
        { name: 'Bottoms', type: 'western', slug: 'bottoms-western', image: '/assets/jeans.jpg' },
        { name: 'Cord sets', type: 'western', slug: 'cord-sets-western', image: '/assets/western-cordset.jpg' }
      ];

      for (const cat of categoriesToSeed) {
        await Category.findOneAndUpdate(
          { slug: cat.slug },
          {
            name: cat.name,
            slug: cat.slug,
            type: cat.type,
            image: cat.image,
            isActive: true,
            displayOrder: 10
          },
          { upsert: true }
        );
      }
      console.log('✅ Categories synchronized successfully');
    } else {
      console.log('ℹ️ Categories already exist. Skipping automatic seeding.');
    }
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
    const { category, type } = req.query;
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

    if (type) {
      query.type = type;
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
  if (req.user.role !== 'admin' && req.user.role !== 'employee') return res.status(403).json({ message: 'Forbidden' });
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

app.post('/api/orders', async (req, res) => {
  try {
    const { userId, products, totalAmount, discount, deliveryCharge, shippingAddress, payment } = req.body;

    let finalUserId = userId;

    // Check token if present in authorization headers
    let authenticatedUser = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const secret = process.env.JWT_SECRET || 'richgirl_jwt_secret_fallback_key_2024';
        const decoded = jwt.verify(token, secret);
        authenticatedUser = await User.findById(decoded.id);
      } catch (err) {
        console.error('Invalid token in order placement:', err);
      }
    }

    if (authenticatedUser) {
      finalUserId = authenticatedUser._id;
    } else {
      // Find or create customer user by phone
      if (!shippingAddress || !shippingAddress.phone || !shippingAddress.fullName) {
        return res.status(400).json({ message: 'Shipping address phone and fullName are required' });
      }
      let guestUser = await User.findOne({ phone: shippingAddress.phone });
      if (!guestUser) {
        guestUser = new User({
          name: shippingAddress.fullName,
          phone: shippingAddress.phone,
          email: shippingAddress.email || undefined,
          role: 'customer',
          isVerified: true
        });
        await guestUser.save();
      } else if (shippingAddress.email && !guestUser.email) {
        // Update guest email if they now provided it
        guestUser.email = shippingAddress.email;
        await guestUser.save();
      }
      finalUserId = guestUser._id;
    }

    const newOrder = new Order({
      orderId: 'RG-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
      userId: finalUserId,
      products,
      totalAmount,
      discount,
      deliveryCharge,
      shippingAddress,
      payment
    });

    await newOrder.save();

    // Decrement stock for each product in the order
    for (const item of products) {
      try {
        const product = await Product.findById(item.id || item.productId);
        if (product) {
          // Find the specific size-color variant
          const sizeObj = product.sizes.find(s => s.size === item.size);
          if (sizeObj) {
            const variant = sizeObj.variants.find(v => v.color === item.color);
            if (variant) {
              variant.stock = Math.max(0, variant.stock - item.quantity);

              // Recalculate totalStock
              product.totalStock = product.sizes.reduce((acc, s) =>
                acc + s.variants.reduce((vAcc, v) => vAcc + v.stock, 0), 0
              );
              product.inStock = product.totalStock > 0;

              await product.save();

              // Check if we need to alert admin
              checkLowStockAndNotify(product);
            }
          }
        }
      } catch (err) {
        console.error('Error updating stock for order:', err);
      }
    }

    // Clear the user's cart if authenticated
    if (authenticatedUser) {
      await Cart.findOneAndUpdate({ userId: finalUserId }, { items: [] });
    }

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Users (OTP & Login) ---

// Request OTP via WhatsApp/SMS
app.post('/api/users/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    // Find or create user stub
    let user = await User.findOne({ phone });
    if (!user) {
      // We'll create a temporary stub if it's a new registration attempt
      // Or just signal that it's a new user
      console.log(`New user registration attempt for phone: ${phone}`);
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      user.otp = { code: otpCode, expiresAt };
      await user.save();
    } else {
      // For registration flow, we don't save the user yet to avoid spamming the DB with stubs
      // Instead, we'll verify the OTP first. 
      // But for simplicity in this implementation, we'll use a cache or temporary collection if needed.
      // For now, let's create the user with a placeholder name
      user = new User({
        name: 'New User',
        phone,
        otp: { code: otpCode, expiresAt },
        isVerified: false
      });
      await user.save();
    }

    // Send via WhatsApp
    const message = `Your RichGirl verification code is: ${otpCode}. Valid for 10 minutes.`;
    await sendWhatsAppMessage(phone, message);

    res.json({ message: 'OTP sent successfully', isNewUser: user.name === 'New User' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// Verify OTP
app.post('/api/users/verify-otp', async (req, res) => {
  try {
    const { phone, code, name, email } = req.body;
    if (!phone || !code) return res.status(400).json({ message: 'Phone and code are required' });

    const user = await User.findOne({ phone });
    if (!user || !user.otp || user.otp.code !== code) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = undefined; // Clear OTP

    // Update profile if registering
    if (name) user.name = name;
    if (email && email.trim() !== '') {
      // Check if email is already taken by ANOTHER user
      const emailUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (emailUser) {
        return res.status(400).json({ message: 'This email is already linked to another account' });
      }
      user.email = email.toLowerCase();
    }

    await user.save();

    // Ensure cart exists
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({ userId: user._id, items: [] });
      await cart.save();
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role || (user.isAdmin ? 'admin' : 'customer'),
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required for this login method' });
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
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, role: user.role || (user.isAdmin ? 'admin' : 'customer'), isVerified: user.isVerified } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: 'User already exists with this phone number' });
      }
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
app.post('/api/payment/create-order', async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(400).json({ message: 'Razorpay is not configured on the server.' });
    }
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

app.post('/api/payment/verify', async (req, res) => {
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
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
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
  if (req.user.role !== 'admin' && req.user.role !== 'employee') return res.status(403).json({ message: 'Forbidden' });
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

// --- Shiprocket Integration ---

app.get('/api/admin/orders/export-shiprocket', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'employee') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { date } = req.query;
    let query = { shippingStatus: { $in: ['Processing', 'Confirmed'] } };

    if (date) {
      const targetDate = new Date(date);
      const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
      const end = new Date(targetDate); end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(query).lean().sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No pending orders found to export.' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Order Sheet");
    sheet.columns = SHIPROCKET_COLUMNS.map(() => ({ width: 15 }));

    // Grouped Headers
    const row1 = sheet.getRow(1);
    row1.height = 30;
    SHIPROCKET_GROUPS.forEach((g) => {
      if (g.end > g.start) sheet.mergeCells(1, g.start, 1, g.end);
      const cell = sheet.getCell(1, g.start);
      cell.value = g.label;
      cell.font = { name: "Calibri", size: 14, bold: true };
      cell.alignment = { horizontal: "center", vertical: "center" };
      for (let c = g.start; c <= g.end; c++) {
        sheet.getCell(1, c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: g.fill } };
      }
    });

    // Field Headers
    const row2 = sheet.getRow(2);
    row2.height = 40;
    SHIPROCKET_COLUMNS.forEach((col, idx) => {
      const cell = row2.getCell(idx + 1);
      cell.value = col.header;
      cell.font = { name: "Calibri", size: 11, bold: true };
      cell.alignment = { horizontal: "center", vertical: "center", wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    const fmtDate = (d) => {
      if (!d) return "";
      const dt = new Date(d);
      return `${String(dt.getDate()).padStart(2, "0")}-${String(dt.getMonth() + 1).padStart(2, "0")}-${dt.getFullYear()}`;
    };
    const splitName = (name = "") => {
      const parts = name.trim().split(" ");
      return { first: parts[0] || "Customer", last: parts.slice(1).join(" ") || "" };
    };

    let rowIdx = 3;
    for (const order of orders) {
      try {
        const addr = order.shippingAddress;
        if (!addr) continue; // Skip bad orders

        const { first, last } = splitName(addr.fullName);
        const isCoD = order.payment ? order.payment.method === "COD" : true;

        const userDoc = order.userId ? await User.findById(order.userId, { email: 1 }).lean() : null;
        const customerEmail = userDoc?.email || "";

        for (const product of order.products) {
          const rowData = {
            orderId: order.orderId,
            orderDate: fmtDate(order.createdAt),
            verified: "Yes",
            mobile: String(addr.phone || ""),
            firstName: first,
            lastName: last,
            shipAddress: String(addr.street || ""),
            pincode: String(addr.zip || ""),
            city: addr.city || "",
            state: addr.state || "",
            country: addr.country || "India",
            email: customerEmail,
            billAddress: String(addr.street || ""),
            billPincode: String(addr.zip || ""),
            billCity: addr.city || "",
            billState: addr.state || "",
            billCountry: addr.country || "India",
            notify: "Yes",
            channel: "CUSTOM",
            payment: isCoD ? "COD" : "Prepaid",
            productName: `${product.name} (${product.size} - ${product.color})`,
            sku: String(product.productId || product._id || "N/A"),
            qty: product.quantity || 1,
            price: product.priceAtTimeOfPurchase || 0,
            partialCOD: "No",
            paidAmount: isCoD ? 0 : (order.totalAmount || 0),
            shippingChg: order.deliveryCharge || 0,
            totalDisc: order.discount || 0,
            containsDocs: "No",
            weight: 0.5,
            length: 20,
            breadth: 15,
            height: 5,
            packageCount: 1
          };

          const row = sheet.getRow(rowIdx++);
          SHIPROCKET_COLUMNS.forEach((col, idx) => {
            row.getCell(idx + 1).value = rowData[col.key] ?? "";
            row.getCell(idx + 1).font = { name: "Calibri", size: 11 };
            row.getCell(idx + 1).alignment = { horizontal: "center" };
          });
        }
      } catch (orderErr) {
        console.error(`Skipping order ${order.orderId} due to error:`, orderErr.message);
      }
    }

    const dateStr = new Date().toISOString().split("T")[0];
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=shiprocket_orders_${dateStr}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Shiprocket Export Final Error:', error);
    res.status(500).json({ message: 'Export failed: ' + error.message });
  }
});

app.post('/api/admin/orders/import-shiprocket', requireAuth, upload.single('report'), async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'employee') return res.status(403).json({ message: 'Forbidden' });
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.getWorksheet(1);

    let headers = [];
    sheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value?.toString().toLowerCase().trim();
    });

    let orderIdIdx = headers.findIndex(h => h?.includes('order id') || h?.includes('order_id'));
    let awbIdx = headers.findIndex(h => h?.includes('awb') || h?.includes('tracking') || h?.includes('waybill'));

    if (orderIdIdx === -1 || awbIdx === -1) {
      // Try row 2 if row 1 headers were not found (sometimes row 1 is section labels)
      headers = [];
      sheet.getRow(2).eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value?.toString().toLowerCase().trim();
      });
      orderIdIdx = headers.findIndex(h => h?.includes('order id') || h?.includes('order_id'));
      awbIdx = headers.findIndex(h => h?.includes('awb') || h?.includes('tracking') || h?.includes('waybill'));
    }

    if (orderIdIdx === -1 || awbIdx === -1) {
      return res.status(400).json({ message: 'Could not find "Order Id" and "AWB Number" columns in the file' });
    }

    let successCount = 0;
    const errors = [];
    const updatePromises = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 2) return; // Skip headers
      const orderId = row.getCell(orderIdIdx).value?.toString().trim();
      const trackingId = row.getCell(awbIdx).value?.toString().trim();

      if (orderId && trackingId) {
        updatePromises.push(
          Order.findOneAndUpdate(
            { orderId: orderId },
            { trackingId, shippingStatus: 'Shipped' },
            { new: true }
          ).then(updated => {
            if (updated) successCount++;
            else errors.push(`Order ID ${orderId} not found in database`);
          })
        );
      }
    });

    await Promise.all(updatePromises);
    res.json({ message: 'Import completed', successCount, errors });
  } catch (error) {
    res.status(500).json({ message: 'Import failed', error: error.message });
  }
});

app.get('/api/admin/users', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const formatted = users.map(u => ({ ...u.toObject(), id: u._id }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Create User (e.g. Employee)
app.post('/api/admin/users', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or phone' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = password ? await bcrypt.hash(password, salt) : undefined;

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'employee',
      isAdmin: role === 'admin',
      isVerified: true // Admin created accounts are pre-verified
    });

    await newUser.save();

    // Create cart for the new user
    const newCart = new Cart({ userId: newUser._id, items: [] });
    await newCart.save();

    res.status(201).json({ message: 'User created successfully', id: newUser._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update User
app.put('/api/admin/users/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { name, email, phone, role, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) {
      user.role = role;
      user.isAdmin = role === 'admin';
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Delete User
app.delete('/api/admin/users/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    await User.findByIdAndDelete(req.params.id);
    // Also delete their cart
    await Cart.findOneAndDelete({ userId: req.params.id });
    res.json({ message: 'User deleted successfully' });
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

// --- Product Creation (Admin & Employee) ---
app.post('/api/products', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'employee') return res.status(403).json({ message: 'Forbidden' });
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

// Update Product (Admin & Employee)
app.put('/api/products/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'employee') return res.status(403).json({ message: 'Forbidden' });
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

// Delete Product (Admin & Employee)
app.delete('/api/products/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'employee') return res.status(403).json({ message: 'Forbidden' });
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- Admin Order Update ---
app.put('/api/admin/orders/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
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

// (duplicate /api/categories route removed — see definition above near the Categories API section)


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

// --- Low Stock Helper ---
async function checkLowStockAndNotify(product) {
  const LOW_STOCK_THRESHOLD = 5;
  if (product.totalStock <= LOW_STOCK_THRESHOLD) {
    console.log(`⚠️ LOW STOCK ALERT: Product "${product.name}" is low on stock (${product.totalStock} remaining).`);

    // In a real production environment, you would call a notification service here
    // Example using existing WhatsApp service:
    try {
      const adminPhone = process.env.ADMIN_PHONE || '919876543210';
      const message = `🚨 *RichGirl Inventory Alert*\n\nProduct: ${product.name}\nRemaining Stock: ${product.totalStock}\n\nPlease restock soon!`;

      // await sendWhatsAppMessage(adminPhone, message);
      console.log('✅ WhatsApp alert simulation sent to Admin.');
    } catch (err) {
      console.error('Failed to send inventory alert:', err);
    }
  }
}

export default app;
