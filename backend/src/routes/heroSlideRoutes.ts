import { Router } from 'express';
import {
  getHeroSlides,
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} from '../controllers/heroSlideController';
import { protect, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { validate } from '../middlewares/validate';
import { createHeroSlideSchema, updateHeroSlideSchema } from '../validators';

const router = Router();

// Public route - get active slides for home page
router.get('/', getHeroSlides);

// Admin routes
router.get('/all', protect, authorize('admin'), getAllHeroSlides);
router.post('/', protect, authorize('admin'), upload.single('image'), validate(createHeroSlideSchema), createHeroSlide);
router.put('/:id', protect, authorize('admin'), upload.single('image'), validate(updateHeroSlideSchema), updateHeroSlide);
router.delete('/:id', protect, authorize('admin'), deleteHeroSlide);

export default router;
