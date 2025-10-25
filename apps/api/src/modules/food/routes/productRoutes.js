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
router.get('/:id', getProductById);

// Admin routes (authentication TEMPORARILY DISABLED for development)
router.post('/', createProduct); // adminAuth removed
router.put('/:id', updateProduct); // adminAuth removed
router.delete('/:id', deleteProduct); // adminAuth removed
router.patch('/:id/toggle-status', toggleProductStatus); // adminAuth removed
router.get('/admin/stats', getProductStats); // adminAuth removed

export default router;

