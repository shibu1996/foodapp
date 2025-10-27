import express from 'express';
import {
  getAllInventory,
  getLowStockProducts,
  updateStock,
  setStock,
  getStockHistory,
  updateLowStockThreshold,
  getInventoryStats,
  bulkUpdateStock
} from '../controllers/inventoryController.js';

const router = express.Router();

// Admin routes (authentication TEMPORARILY DISABLED for development)
router.get('/', getAllInventory); // Get all products with stock info
router.get('/stats', getInventoryStats); // Get inventory statistics
router.get('/low-stock', getLowStockProducts); // Get low stock products
router.get('/:id/history', getStockHistory); // Get stock history for a product

router.patch('/:id/update-stock', updateStock); // Update stock (add/remove)
router.patch('/:id/set-stock', setStock); // Set stock (absolute value)
router.patch('/:id/threshold', updateLowStockThreshold); // Update low stock threshold
router.post('/bulk-update', bulkUpdateStock); // Bulk stock update

export default router;

