import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls
  phone: { type: String, required: true, unique: true },
  password: { type: String }, // Make password optional for OTP-only users
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['admin', 'employee', 'customer'], default: 'customer' },
  isVerified: { type: Boolean, default: false },
  addresses: [{
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    isDefault: { type: Boolean, default: false }
  }],
  otp: {
    code: { type: String },
    expiresAt: { type: Date }
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
