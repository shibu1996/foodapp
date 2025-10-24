import express from 'express';
import {
  createSubscription,
  getMySubscriptions,
  getSubscriptionById,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  skipDay,
  modifySubscription,
  getAllSubscriptions,
  updateSubscriptionStatus,
  getSubscriptionStats,
  getTodaysDeliveries,
} from '../controllers/subscriptionController';
import { auth } from '../../../shared/middleware/auth';
import { adminAuth } from '../../../shared/middleware/adminAuth';

const router = express.Router();

// User routes (require authentication)
router.post('/', auth, createSubscription);
router.get('/my-subscriptions', auth, getMySubscriptions);
router.get('/:id', auth, getSubscriptionById);
router.patch('/:id/pause', auth, pauseSubscription);
router.patch('/:id/resume', auth, resumeSubscription);
router.patch('/:id/cancel', auth, cancelSubscription);
router.patch('/:id/skip-day', auth, skipDay);
router.patch('/:id/modify', auth, modifySubscription);

// Admin routes (authentication TEMPORARILY DISABLED for development)
router.get('/admin/all', getAllSubscriptions); // adminAuth removed
router.patch('/admin/:id/status', updateSubscriptionStatus); // adminAuth removed
router.get('/admin/stats', getSubscriptionStats); // adminAuth removed
router.get('/admin/today', getTodaysDeliveries); // adminAuth removed

export default router;


