import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} from '../controllers/categoryController';
import { protect, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createCategorySchema, updateCategorySchema } from '../validators';

const router = Router();

router.get('/', getCategories);
router.get('/:id/products', getCategoryProducts);
router.get('/:id', getCategory);
router.post('/', protect, authorize('admin'), validate(createCategorySchema), createCategory);
router.put('/:id', protect, authorize('admin'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
