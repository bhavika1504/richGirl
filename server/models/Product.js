import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categoryName: { type: String },
  type: { type: String, enum: ['indian', 'western'] },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discountPrice: { type: Number },
  discount: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  totalStock: { type: Number, default: 0 },
  fabric: { type: String },
  length: { type: String },
  occasion: { type: String },
  images: [{ type: String }],
  colors: [{ type: String }],
  sizes: [{
    size: { type: String },
    variants: [{
      color: { type: String }, // Base visual color
      colorLabel: { type: String }, // Display name
      stock: { type: Number, default: 0 }
    }]
  }],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
