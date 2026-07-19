import mongoose from 'mongoose';
import { Order } from './models/Order.js';

const MONGO_URI = "mongodb+srv://rich_girl_1990:s34EbZ2KfUJTMxMv@richgirl.qhlla8d.mongodb.net/RichGirl_Test";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
    console.log(`Found ${orders.length} recent orders:`);
    for (const order of orders) {
      console.log(`- Order: ${order.orderId}, User: ${order.userId}, Total: ${order.totalAmount}, Status: ${order.payment?.status}, Date: ${order.createdAt}`);
    }
  } catch (err) {
    console.error("Error reading orders:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
