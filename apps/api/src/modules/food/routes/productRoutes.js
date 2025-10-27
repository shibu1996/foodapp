import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductStats,
} from '../controllers/productController.js';
import { adminAuth } from '../../../shared/middleware/adminAuth.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getProducts);

// Admin routes (authentication TEMPORARILY DISABLED for development)
// IMPORTANT: Specific routes BEFORE dynamic :id routes
router.get('/admin/stats', getProductStats); // adminAuth removed

// 🚨 DANGER: Delete all products (ONLY FOR TESTING)
// MUST be before :id routes to avoid "admin" being treated as an ID
router.delete('/admin/delete-all-products', async (req, res) => {
  try {
    const Product = (await import('../models/Product.js')).default;
    const result = await Product.deleteMany({});
    
    console.log('🗑️ Deleted all products:', result.deletedCount);
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} products`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// These MUST come after specific routes to avoid path conflicts
router.get('/:id', getProductById);
router.post('/', createProduct); // adminAuth removed
router.put('/:id', updateProduct); // adminAuth removed
router.delete('/:id', deleteProduct); // adminAuth removed
router.patch('/:id/toggle-status', toggleProductStatus); // adminAuth removed

export default router;

