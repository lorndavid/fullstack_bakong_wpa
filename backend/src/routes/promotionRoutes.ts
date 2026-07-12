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
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import { createPromotionSchema, updatePromotionSchema, mongoIdParam, paginationQuery } from '../validators';

const router = Router();

// Public
router.get('/active', getActivePromotions);
router.get('/products', validateQuery(paginationQuery), getPromotionProducts); // Get products for selection

// Admin only
router.get('/', protect, authorize('admin'), validateQuery(paginationQuery), getPromotions);
router.get('/:id', protect, authorize('admin'), validateParams(mongoIdParam), getPromotion);
router.post('/', protect, authorize('admin'), upload.single('bannerImage'), validate(createPromotionSchema), createPromotion);
router.put('/:id', protect, authorize('admin'), upload.single('bannerImage'), validateParams(mongoIdParam), validate(updatePromotionSchema), updatePromotion);
router.delete('/:id', protect, authorize('admin'), validateParams(mongoIdParam), deletePromotion);

export default router;
