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
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import { createCategorySchema, updateCategorySchema, mongoIdParam, paginationQuery } from '../validators';

const router = Router();

router.get('/', validateQuery(paginationQuery), getCategories);
router.get('/:id/products', validateParams(mongoIdParam), validateQuery(paginationQuery), getCategoryProducts);
router.get('/:id', validateParams(mongoIdParam), getCategory);
router.post('/', protect, authorize('admin'), validate(createCategorySchema), createCategory);
router.put('/:id', protect, authorize('admin'), validateParams(mongoIdParam), validate(updateCategorySchema), updateCategory);
router.delete('/:id', protect, authorize('admin'), validateParams(mongoIdParam), deleteCategory);

export default router;
