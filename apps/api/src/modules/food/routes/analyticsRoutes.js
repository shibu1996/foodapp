import express from 'express';
import {
  getSalesAnalytics,
  getRevenueAnalytics,
  getPopularProducts,
  getCustomerInsights,
  getDeliveryPerformance,
  getDashboardOverview,
  getProductPerformance
} from '../controllers/analyticsController.js';

const router = express.Router();

// Admin routes (authentication TEMPORARILY DISABLED for development)
router.get('/dashboard', getDashboardOverview); // Overall dashboard stats
router.get('/sales', getSalesAnalytics); // Sales analytics (daily/weekly/monthly)
router.get('/revenue', getRevenueAnalytics); // Revenue breakdown
router.get('/popular-products', getPopularProducts); // Top selling products
router.get('/customer-insights', getCustomerInsights); // Customer analytics
router.get('/delivery-performance', getDeliveryPerformance); // Delivery stats
router.get('/product-performance', getProductPerformance); // Product ratings & performance

export default router;

