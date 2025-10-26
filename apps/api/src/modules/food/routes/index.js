import { Router } from 'express';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import orderRoutes from './orderRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import subscriptionCartRoutes from './subscriptionCartRoutes.js';
import chargeRoutes from './chargeRoutes.js';

const router = Router();

// Food module routes
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/subscription-cart', subscriptionCartRoutes);
router.use('/charges', chargeRoutes);

export default router;

