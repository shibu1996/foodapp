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
  deleteSubscription,
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

// 🚨 DANGER: Delete all subscriptions (ONLY FOR TESTING)
// MUST be before :id routes to avoid "delete-all-subscriptions" being treated as an ID
router.delete('/admin/delete-all-subscriptions', async (req, res) => {
  try {
    const Subscription = (await import('../models/Subscription.js')).default;
    const result = await Subscription.deleteMany({});
    
    console.log('🗑️ Deleted all subscriptions:', result.deletedCount);
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} subscriptions`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all subscriptions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// These MUST come after specific routes like delete-all-subscriptions
router.get('/admin/:id', getSubscriptionByIdAdmin); // adminAuth removed
router.patch('/admin/:id/status', updateSubscriptionStatus); // adminAuth removed
router.delete('/:id', deleteSubscription); // adminAuth removed

export default router;

