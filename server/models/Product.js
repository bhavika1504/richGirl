import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categoryName: { type: String },
  type: { type: String, enum: ['indian', 'western'] },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  fabric: { type: String },
  length: { type: String },
  occasion: { type: String },
  images: [{ type: String }],
  colors: [{ type: String }],
  sizes: [{
    size: { type: String },
    stock: { type: Number, default: 0 }
  }],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
