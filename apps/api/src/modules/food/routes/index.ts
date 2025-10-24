import { Router } from 'express';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import orderRoutes from './orderRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import subscriptionCartRoutes from './subscriptionCartRoutes';

const router = Router();

// Food module routes
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/subscription-cart', subscriptionCartRoutes);

export default router;

