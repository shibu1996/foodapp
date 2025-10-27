import express from 'express';
import {
  createOrder,
  verifyPayment,
  handleWebhook,
  processRefund,
  getPaymentDetails,
  getUserPayments,
  getAllPayments
} from '../controllers/paymentController.js';

const router = express.Router();

// Public/User routes (authentication TEMPORARILY DISABLED for development)
router.post('/create-order', createOrder); // Create Razorpay order
router.post('/verify', verifyPayment); // Verify payment signature
router.post('/webhook', handleWebhook); // Razorpay webhook handler

// User routes
router.get('/user/:userId', getUserPayments); // Get user's payment history
router.get('/:id', getPaymentDetails); // Get payment details

// Admin routes
router.get('/', getAllPayments); // Get all payments (admin)
router.post('/refund', processRefund); // Process refund (admin)

export default router;

