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

// 🚨 DANGER: Delete all orders (ONLY FOR TESTING)
// MUST be before :id routes to avoid "delete-all-orders" being treated as an ID
router.delete('/admin/delete-all-orders', async (req, res) => {
  try {
    const Order = (await import('../models/Order.js')).default;
    const result = await Order.deleteMany({});
    
    console.log('🗑️ Deleted all orders:', result.deletedCount);
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} orders`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all orders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// These MUST come after specific routes like delete-all-orders
router.get('/admin/:id', getOrderByIdAdmin); // adminAuth removed
router.patch('/admin/:id/status', updateOrderStatus); // adminAuth removed
router.delete('/admin/:id', deleteOrder); // adminAuth removed

export default router;

