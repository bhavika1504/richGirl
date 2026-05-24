import mongoose from 'mongoose';

const verificationTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  type: { type: String, enum: ['verify', 'reset'], required: true },
});

export const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);
