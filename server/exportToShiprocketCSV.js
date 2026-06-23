// exportToShiprocketCSV.js v2 — Exact Shiprocket format
// Run: node server/exportToShiprocketCSV.js           → today's orders
// Run: node server/exportToShiprocketCSV.js 2026-06-04 → specific date

import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Order } from './models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from root
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true });

// ── Exact Shiprocket column headers (v2) ──
const HEADERS = [
    "*Order Id",
    "Order Date as dd-mm-yyyy hh:MM",
    "*Channel",
    "*Payment Method(COD/Prepaid)",
    "*Customer First Name",
    "Customer Last Name",
    "Email (Optional)",
    "*Customer Mobile",
    "Customer Alternate Mobile",
    "*Shipping Address Line 1",
    "Shipping Address Line 2",
    "*Shipping Address Country",
    "*Shipping Address State",
    "*Shipping Address City",
    "*Shipping Address Postcode",
    "Billing Address Line 1",
    "Billing Address Line 2",
    "Billing Address Country",
    "Billing Address State",
    "Billing Address City",
    "Billing Address Postcode",
    "*Master SKU",
    "*Product Name",
    "*Product Quantity",
    "Tax %",
    "*Selling Price(Per Unit Item, Inclusive of Tax)",
    "Discount(Per Unit Item)",
    "Shipping Charges(Per Order)",
    "COD Charges(Per Order)",
    "Gift Wrap Charges(Per Order)",
    "Total Discount (Per Order)",
    "*Partial COD (Yes/No)",
    "Paid Amount (Rs.)",
    "*Length (cm)",
    "*Breadth (cm)",
    "*Height (cm)",
    "*Weight Of Shipment(kg)",
    "Send Notification(True/False)",
    "Comment",
];

// ── Package defaults — update as per your packaging ──
const WEIGHT = "0.5";
const LENGTH = "20";
const BREADTH = "15";
const HEIGHT = "5";

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}

function splitName(fullName = "") {
    const parts = fullName.trim().split(" ");
    const first = parts[0] || "Customer";
    const last = parts.slice(1).join(" ") || "";
    return { first, last };
}

function escapeCSV(val) {
    const str = String(val ?? "").replace(/"/g, '""');
    return str.includes(",") || str.includes("\n") || str.includes('"')
        ? `"${str}"`
        : str;
}

async function exportOrders(filterDate = null) {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI not found in environment variables");
        }

        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB ✓");

        // Date filter
        let query = {};
        const targetDate = filterDate ? new Date(filterDate) : new Date();
        const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
        const end = new Date(targetDate); end.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: start, $lte: end };

        // Fetch orders
        const orders = await Order.find(query).lean();

        if (orders.length === 0) {
            console.log("No orders found for this date.");
            process.exit(0);
        }

        console.log(`Found ${orders.length} order(s). Building CSV v2...`);

        const rows = [HEADERS.join(",")];

        for (const order of orders) {
            const addr = order.shippingAddress;
            const { first, last } = splitName(addr.fullName);
            const isCoD = order.payment.method === "COD";
            const dateStr = formatDate(order.createdAt);

            // Direct DB access for email to avoid Mongoose registration issues
            let customerEmail = "";
            if (order.userId) {
                const user = await mongoose.connection.db.collection('users').findOne(
                    { _id: order.userId },
                    { projection: { email: 1 } }
                );
                customerEmail = user?.email || "";
            }

            for (const product of order.products) {
                const sku = product.productId?.toString() || product._id?.toString() || "SKU001";
                const productName = `${product.name} (${product.size} - ${product.color})`;

                const row = [
                    order.orderId,                          // *Order Id
                    dateStr,                                // Order Date
                    "CUSTOM",                               // *Channel
                    isCoD ? "COD" : "Prepaid",              // *Payment Method
                    first,                                  // *Customer First Name
                    last,                                   // Customer Last Name
                    customerEmail,                          // Email (Optional)
                    addr.phone,                             // *Customer Mobile
                    "",                                     // Customer Alternate Mobile
                    addr.street,                            // *Shipping Address Line 1
                    "",                                     // Shipping Address Line 2
                    addr.country || "India",                // *Shipping Address Country
                    addr.state,                             // *Shipping Address State
                    addr.city,                              // *Shipping Address City
                    addr.zip,                               // *Shipping Address Postcode
                    addr.street,                            // Billing Address Line 1
                    "",                                     // Billing Address Line 2
                    addr.country || "India",                // Billing Address Country
                    addr.state,                             // Billing Address State
                    addr.city,                              // Billing Address City
                    addr.zip,                               // Billing Address Postcode
                    sku,                                    // *Master SKU
                    productName,                            // *Product Name
                    product.quantity,                       // *Product Quantity
                    "0",                                    // Tax %
                    product.priceAtTimeOfPurchase,          // *Selling Price
                    order.discount || "0",                  // Discount per unit
                    order.deliveryCharge || "0",            // Shipping Charges
                    isCoD ? "0" : "",                       // COD Charges
                    "0",                                    // Gift Wrap Charges
                    order.discount || "0",                  // Total Discount
                    "No",                                   // *Partial COD
                    isCoD ? "0" : order.totalAmount,        // Paid Amount
                    LENGTH,                                 // *Length
                    BREADTH,                                // *Breadth
                    HEIGHT,                                 // *Height
                    WEIGHT,                                 // *Weight
                    "True",                                 // Send Notification
                    "",                                     // Comment
                ].map(escapeCSV);

                rows.push(row.join(","));
            }
        }

        const dateLabel = targetDate.toISOString().split("T")[0];
        const filename = `shiprocket_orders_${dateLabel}.csv`;
        const outputPath = path.join(__dirname, filename);

        fs.writeFileSync(outputPath, rows.join("\n"), "utf8");

        console.log(`\n✅ Done!`);
        console.log(`📁 File: ${filename}`);
        console.log(`📦 Orders: ${orders.length}`);
        console.log(`\nNext: Shiprocket → Orders → Import Orders → Upload CSV\n`);

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

const dateArg = process.argv[2] ?? null;
exportOrders(dateArg);
