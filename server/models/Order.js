import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true },
  priceAtTimeOfPurchase: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  promoCode: { type: String },
  deliveryCharge: { type: Number, default: 0 },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  payment: {
    method: { type: String, required: true },
    status: { type: String, enum: ['unpaid', 'paid', 'failed'], default: 'unpaid' },
    paymentId: { type: String }
  },
  shippingStatus: { 
    type: String, 
    enum: ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  trackingId: { type: String },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
