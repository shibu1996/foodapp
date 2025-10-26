import express from 'express';
import {
  getAllTimeSlots,
  getActiveTimeSlots,
  getTimeSlotById,
  createTimeSlot,
  updateTimeSlot,
  toggleTimeSlotStatus,
  deleteTimeSlot
} from '../controllers/timeSlotController.js';

const router = express.Router();

// Public routes
router.get('/active', getActiveTimeSlots);
router.get('/:id', getTimeSlotById);

// Admin routes (add auth middleware later)
router.get('/', getAllTimeSlots);
router.post('/', createTimeSlot);
router.put('/:id', updateTimeSlot);
router.patch('/:id/toggle-status', toggleTimeSlotStatus);
router.delete('/:id', deleteTimeSlot);

export default router;

