import express from 'express';
import {
  getSettings,
  updateSettings,
  testPaymentGateway
} from '../controllers/settingsController.js';

const router = express.Router();

// Admin routes (authentication TEMPORARILY DISABLED for development)
router.get('/', getSettings); // Get all settings
router.put('/', updateSettings); // Update settings
router.post('/test-payment-gateway', testPaymentGateway); // Test payment gateway connection

export default router;

