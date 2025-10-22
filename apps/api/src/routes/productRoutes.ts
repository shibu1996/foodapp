import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProductStats,
} from '../controllers/productController';
import { adminAuth } from '../middleware/adminAuth';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes (authentication required)
router.post('/', adminAuth, createProduct);
router.put('/:id', adminAuth, updateProduct);
router.delete('/:id', adminAuth, deleteProduct);
router.patch('/:id/toggle-status', adminAuth, toggleProductStatus);
router.get('/admin/stats', adminAuth, getProductStats);

export default router;

