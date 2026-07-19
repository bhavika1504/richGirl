import mongoose from 'mongoose';
import { Order } from './models/Order.js';
import { User } from './models/User.js';
import { Product } from './models/Product.js';

const MONGO_URI = "mongodb+srv://rich_girl_1990:s34EbZ2KfUJTMxMv@richgirl.qhlla8d.mongodb.net/RichGirl_Test";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected!");

    // 1. Fetch a product to get a valid product ID
    const product = await Product.findOne();
    if (!product) {
      console.error("No products found in DB to test with!");
      process.exit(1);
    }
    console.log(`Using product: ${product.name} (${product._id})`);

    // Mock shipping details
    const shippingAddress = {
      fullName: "Test Guest User",
      phone: "9876543210",
      street: "123 Test Street",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400001",
      country: "India",
      email: "test_guest_unique@example.com"
    };

    // 2. Perform same user resolution as server
    let guestUser = await User.findOne({ phone: shippingAddress.phone });
    if (!guestUser) {
      guestUser = new User({
        name: shippingAddress.fullName,
        phone: shippingAddress.phone,
        email: shippingAddress.email,
        role: 'customer',
        isVerified: true
      });
      await guestUser.save();
      console.log("Created new guest user:", guestUser._id);
    } else {
      console.log("Found existing guest user:", guestUser._id);
    }

    const orderData = {
      orderId: 'RG-TEST-' + Math.floor(10000 + Math.random() * 90000),
      userId: guestUser._id,
      products: [{
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || 'mock.png',
        size: "S",
        color: "Fusia Pink",
        quantity: 1,
        priceAtTimeOfPurchase: product.price
      }],
      totalAmount: product.price + 99,
      discount: 0,
      deliveryCharge: 99,
      shippingAddress,
      payment: {
        method: "Razorpay",
        status: "paid",
        paymentId: "pay_test12345"
      }
    };

    // 3. Try to save the order
    console.log("Saving order...");
    const newOrder = new Order(orderData);
    await newOrder.save();
    console.log("SUCCESS! Order saved successfully:", newOrder.orderId);

  } catch (err) {
    console.error("mongoose simulation error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
