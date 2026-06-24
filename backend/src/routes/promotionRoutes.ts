import { Router } from 'express';
import {
  getPromotions,
  getActivePromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionProducts,
} from '../controllers/promotionController';
import { protect, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Public
router.get('/active', getActivePromotions);
router.get('/products', getPromotionProducts); // Get products for selection

// Admin only
router.get('/', protect, authorize('admin'), getPromotions);
router.get('/:id', protect, authorize('admin'), getPromotion);
router.post('/', protect, authorize('admin'), upload.single('bannerImage'), createPromotion);
router.put('/:id', protect, authorize('admin'), upload.single('bannerImage'), updatePromotion);
router.delete('/:id', protect, authorize('admin'), deletePromotion);

export default router;
