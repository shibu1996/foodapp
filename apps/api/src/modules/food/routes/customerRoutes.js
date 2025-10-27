import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
  toggleUserStatus,
  exportCustomers,
  getCustomerStats
} from '../controllers/customerController.js';

const router = express.Router();

// Admin routes (authentication TEMPORARILY DISABLED for development)
router.get('/', getAllCustomers); // Get all customers with pagination
router.get('/stats', getCustomerStats); // Get customer statistics
router.get('/export', exportCustomers); // Export customer data to CSV
router.get('/:id', getCustomerById); // Get customer details
router.get('/:id/orders', getCustomerOrders); // Get customer order history
router.patch('/:id/toggle-status', toggleUserStatus); // Block/Unblock user

export default router;

