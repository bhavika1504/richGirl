import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  brandName: { type: String }, // Internal only - not displayed to customer
  pieceNumber: { type: String },
  designId: { type: String }, // e.g. GU0208/101
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
  sizeGuide: {
    headers: [{ type: String }],
    rows: [[{ type: String }]]
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
