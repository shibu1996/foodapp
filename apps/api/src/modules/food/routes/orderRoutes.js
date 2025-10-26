import express from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  getTodaysOrders,
} from '../controllers/orderController.js';
import { auth } from '../../../shared/middleware/auth.js';
import { adminAuth } from '../../../shared/middleware/adminAuth.js';

const router = express.Router();

// User routes (require authentication)
router.post('/', auth, placeOrder);
router.get('/my-orders', auth, getMyOrders);
router.get('/:id', auth, getOrderById);
router.patch('/:id/cancel', auth, cancelOrder);

// Admin routes (authentication TEMPORARILY DISABLED for development)
// IMPORTANT: Specific routes BEFORE dynamic :id routes
router.get('/admin/all', getAllOrders); // adminAuth removed
router.get('/admin/stats', getOrderStats); // adminAuth removed
router.get('/admin/today', getTodaysOrders); // adminAuth removed
router.get('/admin/:id', getOrderByIdAdmin); // adminAuth removed - MUST be after specific routes
router.patch('/admin/:id/status', updateOrderStatus); // adminAuth removed
router.delete('/admin/:id', deleteOrder); // adminAuth removed

export default router;

