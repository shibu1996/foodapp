import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  syncProductCounts,
  reorderCategories,
} from '../controllers/categoryController.js';
import { adminAuth } from '../../../shared/middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin routes
router.post('/', adminAuth, createCategory);
router.put('/:id', adminAuth, updateCategory);
router.delete('/:id', adminAuth, deleteCategory);
router.patch('/:id/toggle-status', adminAuth, toggleCategoryStatus);
router.post('/admin/sync-counts', adminAuth, syncProductCounts);
router.post('/admin/reorder', adminAuth, reorderCategories);

export default router;

