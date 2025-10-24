import { Router } from 'express';
import {
  sendOTP,
  verifyOTPController,
  completeRegistration,
  getCurrentUser,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter, expensiveOperationLimiter } from '../middleware/rateLimit';

const router = Router();

// Very strict rate limiting for OTP sending (expensive operation)
router.post('/send-otp', expensiveOperationLimiter, sendOTP);

// Strict rate limiting for OTP verification (prevent brute force)
router.post('/verify-otp', authLimiter, verifyOTPController);

// Normal rate limiting for registration completion
router.post('/complete-registration', authenticate, completeRegistration);

// No extra rate limiting for getting current user (already has global limit)
router.get('/me', authenticate, getCurrentUser);

export default router;


