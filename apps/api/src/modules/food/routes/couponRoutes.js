import express from 'express';
import {
  getAllCoupons,
  getActiveCoupons,
  getCouponById,
  validateCoupon,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon
} from '../controllers/couponController.js';
import { adminAuth } from '../../../shared/middleware/adminAuth.js';

const router = express.Router();

// Public routes (for users)
router.get('/active', getActiveCoupons);
router.post('/validate', validateCoupon);

// Admin routes (authentication TEMPORARILY DISABLED for development)
router.get('/', getAllCoupons); // adminAuth removed
router.get('/:id', getCouponById); // adminAuth removed
router.post('/', createCoupon); // adminAuth removed
router.put('/:id', updateCoupon); // adminAuth removed
router.patch('/:id/toggle', toggleCouponStatus); // adminAuth removed
router.delete('/:id', deleteCoupon); // adminAuth removed

export default router;

