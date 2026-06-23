// server/utils/jwt.js
import jwt from 'jsonwebtoken';


export function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'richgirl_jwt_secret_fallback_key_2024';
  const payload = {
    id: user._id || user.id,
    email: user.email,
    isAdmin: !!user.isAdmin,
    role: user.role || (user.isAdmin ? 'admin' : 'customer'),
  };
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'richgirl_jwt_secret_fallback_key_2024';
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}
