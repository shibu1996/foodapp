import express from 'express';
import {
  getAllCharges,
  getActiveCharges,
  getChargeById,
  createCharge,
  updateCharge,
  deleteCharge,
  toggleChargeStatus
} from '../controllers/chargeController.js';
import { adminAuth } from '../../../shared/middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.get('/active', getActiveCharges);

// Admin routes (authentication TEMPORARILY DISABLED for development)
router.get('/', getAllCharges); // adminAuth removed
router.get('/:id', getChargeById); // adminAuth removed
router.post('/', createCharge); // adminAuth removed
router.put('/:id', updateCharge); // adminAuth removed
router.patch('/:id/toggle', toggleChargeStatus); // adminAuth removed
router.delete('/:id', deleteCharge); // adminAuth removed

export default router;

