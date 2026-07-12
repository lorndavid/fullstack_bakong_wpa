import { Router } from 'express';
import {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getFlashSaleProducts,
  getNewArrivals,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
  getLowStockProducts,
} from '../controllers/productController';
import { protect, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import { createProductSchema, updateProductSchema, mongoIdParam, paginationQuery } from '../validators';

const router = Router();

router.get('/', validateQuery(paginationQuery), getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/flash-sale', getFlashSaleProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/:id', validateParams(mongoIdParam), getProduct);
router.get('/:id/related', validateParams(mongoIdParam), getRelatedProducts);
router.get('/low-stock/overview', validateQuery(paginationQuery), getLowStockProducts);
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.array('images', 5),
  validate(createProductSchema),
  createProduct
);
router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.array('images', 5),
  validateParams(mongoIdParam),
  validate(updateProductSchema),
  updateProduct
);
router.delete('/:id', protect, authorize('admin'), validateParams(mongoIdParam), deleteProduct);

export default router;
