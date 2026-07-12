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
import { validate } from '../middlewares/validate';
import { createPromotionSchema, updatePromotionSchema } from '../validators';

const router = Router();

// Public
router.get('/active', getActivePromotions);
router.get('/products', getPromotionProducts); // Get products for selection

// Admin only
router.get('/', protect, authorize('admin'), getPromotions);
router.get('/:id', protect, authorize('admin'), getPromotion);
router.post('/', protect, authorize('admin'), upload.single('bannerImage'), validate(createPromotionSchema), createPromotion);
router.put('/:id', protect, authorize('admin'), upload.single('bannerImage'), validate(updatePromotionSchema), updatePromotion);
router.delete('/:id', protect, authorize('admin'), deletePromotion);

export default router;
