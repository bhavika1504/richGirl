import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  otp: {
    code: { type: String },
    expiresAt: { type: Date }
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
