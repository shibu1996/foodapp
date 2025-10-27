import express from 'express';
import {
  getAllReviews,
  getProductReviews,
  checkReviewEligibility,
  createReview,
  updateReview,
  respondToReview,
  toggleVerifyReview,
  deleteReview,
  markHelpful,
  reportReview
} from '../controllers/reviewController.js';
import { authenticate } from '../../../shared/middleware/auth.js';
import { adminAuth } from '../../../shared/middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected user routes
router.post('/', authenticate, createReview);
router.put('/:id', authenticate, updateReview);
router.post('/:id/helpful', markHelpful);
router.post('/:id/report', reportReview);
router.get('/check/:orderId', authenticate, checkReviewEligibility);

// Admin routes (authentication TEMPORARILY DISABLED for development)
router.get('/', getAllReviews); // adminAuth removed
router.post('/:id/respond', respondToReview); // adminAuth removed
router.patch('/:id/verify', toggleVerifyReview); // adminAuth removed
router.delete('/:id', deleteReview); // adminAuth removed

export default router;

