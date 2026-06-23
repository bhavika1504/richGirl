// exportToShiprocketXLSX.js
// Generates Shiprocket "Bulk Order" Excel format (full 49-row template with grouped headers)
// Run: node server/exportToShiprocketXLSX.js           → today's orders
// Run: node server/exportToShiprocketXLSX.js 2026-06-04 → specific date

import 'dotenv/config';
import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Order } from './models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from root
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true });

// ── Package defaults — update as per your packaging ──
const WEIGHT = 0.5;   // kg
const LENGTH = 20;    // cm
const BREADTH = 15;   // cm
const HEIGHT = 5;     // cm
const SHIPPING_CHARGES = 99; // Rs. per order

function splitName(fullName = "") {
    const parts = fullName.trim().split(" ");
    return {
        first: parts[0] || "Customer",
        last: parts.slice(1).join(" ") || "",
    };
}

// ── Exact 49 columns from Shiprocket Bulk Order template, in order ──
const COLUMNS = [
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

// ── Grouped header bands (row 1) — [startCol, endCol, label, fillColor] (1-indexed, inclusive) ──
const GROUPS = [
    { start: 1, end: 3, label: "", fill: "FFFFFFFF" }, // A:C blank
    { start: 4, end: 23, label: "Buyer's Details", fill: "FFF4FFE0" }, // D:W
    { start: 24, end: 24, label: "Pickup Details", fill: "FFFFF4F4" }, // X
    { start: 25, end: 43, label: "Order Details", fill: "FFD7EDFF" }, // Y:AQ
    { start: 44, end: 48, label: "Package Details", fill: "FFE4FFF3" }, // AR:AV
    { start: 49, end: 49, label: "Courier Details", fill: "FFFFF1C7" }, // AW
];

function fmtDate(d) {
    if (!d) return "";
    const dt = new Date(d);
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

async function exportOrders(filterDate = null) {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI not found in environment variables");
        }

        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB ✓");

        const targetDate = filterDate ? new Date(filterDate) : new Date();
        const start = new Date(targetDate); start.setHours(0, 0, 0, 0);
        const end = new Date(targetDate); end.setHours(23, 59, 59, 999);

        const orders = await Order.find({ createdAt: { $gte: start, $lte: end } }).lean();

        if (orders.length === 0) {
            console.log("No orders found for this date.");
            process.exit(0);
        }

        console.log(`Found ${orders.length} order(s). Building Excel...`);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Order Sheet");

        // ── Column widths ──
        sheet.columns = COLUMNS.map(() => ({ width: 15 }));

        // ── Row 1: grouped section headers ──
        const row1 = sheet.getRow(1);
        row1.height = 30;
        GROUPS.forEach((g) => {
            const startCell = sheet.getCell(1, g.start);
            if (g.end > g.start) {
                sheet.mergeCells(1, g.start, 1, g.end);
            }
            startCell.value = g.label || null;
            startCell.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FF000000" } };
            startCell.alignment = { horizontal: "center", vertical: "center", wrapText: true };
            for (let c = g.start; c <= g.end; c++) {
                sheet.getCell(1, c).fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: g.fill },
                };
            }
        });

        // ── Row 2: actual field headers ──
        const row2 = sheet.getRow(2);
        row2.height = 40;
        COLUMNS.forEach((col, idx) => {
            const cell = row2.getCell(idx + 1);
            cell.value = col.header;
            cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF000000" } };
            cell.alignment = { horizontal: "center", vertical: "center", wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // ── Data rows, starting row 3 ──
        let rowIdx = 3;
        for (const order of orders) {
            const addr = order.shippingAddress;
            const { first, last } = splitName(addr.fullName);
            const isCoD = order.payment.method === "COD";

            // Fetch user email if available
            let customerEmail = "";
            if (order.userId) {
                try {
                    const user = await mongoose.connection.db.collection('users').findOne(
                        { _id: order.userId },
                        { projection: { email: 1 } }
                    );
                    customerEmail = user?.email || "";
                } catch (e) { }
            }

            for (const product of order.products) {
                const sku = String(product.productId || product._id || "SKU001");
                const productName = `${product.name} (${product.size} - ${product.color})`;

                const rowData = {
                    orderId: order.orderId,
                    orderDate: fmtDate(order.createdAt),
                    verified: "Yes",
                    mobile: String(addr.phone),
                    firstName: first,
                    lastName: last,
                    shipAddress: String(addr.street),
                    landmark: "",
                    pincode: String(addr.zip),
                    city: addr.city,
                    state: addr.state,
                    country: addr.country || "India",
                    email: customerEmail,
                    altMobile: "",
                    companyName: "",
                    gstin: "",
                    billAddress: String(addr.street),
                    billLandmark: "",
                    billPincode: String(addr.zip),
                    billCity: addr.city,
                    billState: addr.state,
                    billCountry: addr.country || "India",
                    notify: "Yes",
                    pickupId: "",
                    channel: "CUSTOM",
                    payment: isCoD ? "COD" : "Prepaid",
                    productName: productName,
                    sku: sku,
                    qty: product.quantity,
                    price: product.priceAtTimeOfPurchase,
                    partialCOD: "No",
                    paidAmount: isCoD ? 0 : order.totalAmount,
                    productDisc: 0,
                    coupon: "",
                    hsn: "",
                    taxRate: 0,
                    shippingChg: order.deliveryCharge || 0,
                    giftWrapChg: 0,
                    txnFee: 0,
                    totalDisc: order.discount || 0,
                    orderTag: "",
                    containsDocs: "No",
                    reseller: "",
                    weight: WEIGHT,
                    length: LENGTH,
                    breadth: BREADTH,
                    height: HEIGHT,
                    packageCount: 1,
                    courierId: "",
                };

                const row = sheet.getRow(rowIdx);
                COLUMNS.forEach((col, idx) => {
                    const cell = row.getCell(idx + 1);
                    cell.value = rowData[col.key];
                    cell.font = { name: "Calibri", size: 11, color: { argb: "FF000000" } };
                    cell.alignment = { horizontal: "center" };
                });
                rowIdx++;
            }
        }

        const dateLabel = targetDate.toISOString().split("T")[0];
        const filename = `shiprocket_bulk_orders_${dateLabel}.xlsx`;
        const outputPath = path.join(__dirname, filename);

        await workbook.xlsx.writeFile(outputPath);

        console.log(`\n✅ Done!`);
        console.log(`📁 File: ${filename}`);
        console.log(`📦 Orders: ${orders.length}`);
        console.log(`\nNext: Shiprocket → Orders → Import Orders → Upload this .xlsx file\n`);

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

const dateArg = process.argv[2] ?? null;
exportOrders(dateArg);
