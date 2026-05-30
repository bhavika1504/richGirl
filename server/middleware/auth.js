// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const secret = process.env.JWT_SECRET || 'richgirl_jwt_secret_fallback_key_2024';
    const decoded = jwt.verify(token, secret);
    // Optionally fetch full user from DB to ensure still exists
    User.findById(decoded.id)
      .then(user => {
        if (!user) return res.status(401).json({ message: 'Invalid token' });
        // Attach user payload to request
        req.user = {
          id: user._id,
          email: user.email,
          isAdmin: !!user.isAdmin,
          isVerified: !!user.isVerified
        };
        next();
      })
      .catch(err => {
        console.error('Auth middleware error', err);
        res.status(500).json({ message: 'Server error' });
      });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
