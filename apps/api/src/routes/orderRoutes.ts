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
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';

const router = express.Router();

// User routes (require authentication)
router.post('/', auth, placeOrder);
router.get('/my-orders', auth, getMyOrders);
router.get('/:id', auth, getOrderById);
router.patch('/:id/cancel', auth, cancelOrder);

// Admin routes (require admin authentication)
router.get('/admin/all', adminAuth, getAllOrders);
router.get('/admin/stats', adminAuth, getOrderStats);
router.get('/admin/today', adminAuth, getTodaysOrders);
router.patch('/admin/:id/status', adminAuth, updateOrderStatus);

export default router;

