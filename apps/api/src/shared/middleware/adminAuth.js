import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user is admin
    // For now, checking if email contains 'admin' or specific admin emails
    const adminEmails = ['admin@foodapp.com', 'admin@restaurant.com'];
    const isAdmin = adminEmails.includes(user.email) || user.email.includes('admin');

    if (!isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

