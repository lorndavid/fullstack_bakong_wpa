import { Router } from 'express';
import authRoutes from './authRoutes';
import categoryRoutes from './categoryRoutes';
import productRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import paymentRoutes from './paymentRoutes';
import userRoutes from './userRoutes';
import heroSlideRoutes from './heroSlideRoutes';
import settingsRoutes from './settingsRoutes';
import promotionRoutes from './promotionRoutes';
import chatRoutes from './chatRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/payment', paymentRoutes);
router.use('/users', userRoutes);
router.use('/hero-slides', heroSlideRoutes);
router.use('/settings', settingsRoutes);
router.use('/promotions', promotionRoutes);
router.use('/chat', chatRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Bakong E-commerce API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
