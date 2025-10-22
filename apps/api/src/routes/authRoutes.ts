import { Router } from 'express';
import {
  sendOTP,
  verifyOTPController,
  completeRegistration,
  getCurrentUser,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPController);
router.post('/complete-registration', authenticate, completeRegistration);
router.get('/me', authenticate, getCurrentUser);

export default router;

