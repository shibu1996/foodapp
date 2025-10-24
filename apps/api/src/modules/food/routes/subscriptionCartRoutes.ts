/**
 * Subscription Cart Routes
 */

import express from 'express';
import { auth } from '../../../middleware/auth';
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  checkout,
} from '../controllers/subscriptionCartController';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Cart operations
router.post('/add', addToCart);
router.get('/', getCart);
router.delete('/:itemId', removeFromCart);
router.put('/:itemId', updateCartItem);
router.delete('/clear/all', clearCart);
router.post('/checkout', checkout);

export default router;


