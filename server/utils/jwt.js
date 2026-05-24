// server/utils/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';
const JWT_EXPIRES_IN = '7d'; // 7 days

export function generateToken(user) {
  // Payload contains minimal needed info
  const payload = {
    id: user._id,
    email: user.email,
    isAdmin: !!user.isAdmin,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
