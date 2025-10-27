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
// IMPORTANT: Specific routes BEFORE dynamic :id routes
router.post('/admin/sync-counts', adminAuth, syncProductCounts);
router.post('/admin/reorder', adminAuth, reorderCategories);

// 🚨 DANGER: Delete all categories (ONLY FOR TESTING)
// MUST be before :id routes to avoid "admin" being treated as an ID
router.delete('/admin/delete-all-categories', async (req, res) => {
  try {
    const Category = (await import('../models/Category.js')).default;
    const result = await Category.deleteMany({});
    
    console.log('🗑️ Deleted all categories:', result.deletedCount);
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} categories`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all categories:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// These MUST come after specific routes to avoid path conflicts
router.post('/', adminAuth, createCategory);
router.put('/:id', adminAuth, updateCategory);
router.delete('/:id', adminAuth, deleteCategory);
router.patch('/:id/toggle-status', adminAuth, toggleCategoryStatus);

export default router;

