import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
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
import notificationRoutes from './notificationRoutes';
import couponRoutes from './couponRoutes';
import inventoryRoutes from './inventoryRoutes';
import pkg from '../../package.json';

const router = Router();

// ── Swagger UI Docs ────────────────────────────────────────────────
const specPath = path.resolve(__dirname, '../../../openapi.yaml');
if (fs.existsSync(specPath)) {
  try {
    const spec = yaml.load(fs.readFileSync(specPath, 'utf8')) as Record<string, any>;
    router.use(
      '/docs',
      swaggerUi.serve,
      swaggerUi.setup(spec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'MY SHOP API Docs',
        swaggerOptions: {
          persistAuthorization: true,
        },
      })
    );
    console.log(`📖 API Docs mounted at /api/docs`);
  } catch (err: any) {
    console.warn(`⚠️ Failed to load openapi.yaml for Swagger UI: ${err.message}`);
  }
} else {
  console.warn(`⚠️ openapi.yaml not found at ${specPath}. Swagger UI not available.`);
}

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
router.use('/notifications', notificationRoutes);
router.use('/coupons', couponRoutes);
router.use('/inventory', inventoryRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Bakong E-commerce API is running',
    timestamp: new Date().toISOString(),
  });
});

// Version — reads from package.json
router.get('/v1', (_req, res) => {
  res.json({
    success: true,
    version: pkg.version,
    name: pkg.name,
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
