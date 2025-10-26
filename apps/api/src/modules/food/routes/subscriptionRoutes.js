import express from 'express';
import {
  createSubscription,
  getMySubscriptions,
  getSubscriptionById,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  skipDay,
  undoSkipDay,
  modifySubscription,
  getAllSubscriptions,
  getSubscriptionByIdAdmin,
  updateSubscriptionStatus,
  getSubscriptionStats,
  getTodaysDeliveries,
} from '../controllers/subscriptionController.js';
import { auth } from '../../../shared/middleware/auth.js';
import { adminAuth } from '../../../shared/middleware/adminAuth.js';

const router = express.Router();

// User routes (require authentication)
router.post('/', auth, createSubscription);
router.get('/my-subscriptions', auth, getMySubscriptions);
router.get('/:id', auth, getSubscriptionById);
router.patch('/:id/pause', auth, pauseSubscription);
router.patch('/:id/resume', auth, resumeSubscription);
router.patch('/:id/cancel', auth, cancelSubscription);
router.patch('/:id/skip-day', auth, skipDay);
router.patch('/:id/undo-skip', auth, undoSkipDay);
router.patch('/:id/modify', auth, modifySubscription);

// Admin routes (authentication TEMPORARILY DISABLED for development)
// IMPORTANT: Specific routes BEFORE dynamic :id routes
router.get('/admin/all', getAllSubscriptions); // adminAuth removed
router.get('/admin/stats', getSubscriptionStats); // adminAuth removed
router.get('/admin/today', getTodaysDeliveries); // adminAuth removed
router.get('/admin/:id', getSubscriptionByIdAdmin); // adminAuth removed - MUST be after specific routes
router.patch('/admin/:id/status', updateSubscriptionStatus); // adminAuth removed

export default router;

