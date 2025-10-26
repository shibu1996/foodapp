import express from 'express';
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getActivePlansByCategory,
} from '../controllers/planController.js';
import { auth } from '../../../shared/middleware/auth.js';
import { adminAuth } from '../../../shared/middleware/adminAuth.js';

const router = express.Router();

// Public routes (for customers)
router.get('/active/:category', getActivePlansByCategory);

// Admin routes (authentication TEMPORARILY DISABLED for development)
router.get('/', getAllPlans); // adminAuth removed
router.get('/:id', getPlanById); // adminAuth removed
router.post('/', createPlan); // adminAuth removed
router.put('/:id', updatePlan); // adminAuth removed
router.delete('/:id', deletePlan); // adminAuth removed

export default router;

