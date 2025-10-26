import express from 'express';
import {
  getAllOutlets,
  getActiveOutlets,
  getOutletById,
  getNearestOutlet,
  createOutlet,
  updateOutlet,
  toggleOutletStatus,
  deleteOutlet,
  calculateDistance
} from '../controllers/outletController.js';

const router = express.Router();

// Public routes
router.get('/active', getActiveOutlets);
router.get('/nearest', getNearestOutlet);
router.post('/calculate-distance', calculateDistance);
router.get('/:id', getOutletById);

// Admin routes (add auth middleware later)
router.get('/', getAllOutlets);
router.post('/', createOutlet);
router.put('/:id', updateOutlet);
router.patch('/:id/toggle-status', toggleOutletStatus);
router.delete('/:id', deleteOutlet);

export default router;


