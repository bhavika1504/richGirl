import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ['indian', 'western'], required: true },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 1 }
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema);
