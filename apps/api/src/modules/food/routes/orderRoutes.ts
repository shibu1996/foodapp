import express from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
  getTodaysOrders,
} from '../controllers/orderController';
import { auth } from '../../../shared/middleware/auth';
import { adminAuth } from '../../../shared/middleware/adminAuth';

const router = express.Router();

// User routes (require authentication)
router.post('/', auth, placeOrder);
router.get('/my-orders', auth, getMyOrders);
router.get('/:id', auth, getOrderById);
router.patch('/:id/cancel', auth, cancelOrder);

// Admin routes (authentication TEMPORARILY DISABLED for development)
router.get('/admin/all', getAllOrders); // adminAuth removed
router.get('/admin/stats', getOrderStats); // adminAuth removed
router.get('/admin/today', getTodaysOrders); // adminAuth removed
router.patch('/admin/:id/status', updateOrderStatus); // adminAuth removed

export default router;


