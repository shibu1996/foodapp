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
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';

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

// Admin routes (require admin authentication)
router.get('/admin/all', adminAuth, getAllSubscriptions);
router.patch('/admin/:id/status', adminAuth, updateSubscriptionStatus);
router.get('/admin/stats', adminAuth, getSubscriptionStats);
router.get('/admin/today', adminAuth, getTodaysDeliveries);

export default router;

