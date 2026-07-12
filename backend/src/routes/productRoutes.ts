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
import { validate } from '../middlewares/validate';
import { createProductSchema, updateProductSchema } from '../validators';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/flash-sale', getFlashSaleProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);
router.get('/low-stock/overview', getLowStockProducts);
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
  validate(updateProductSchema),
  updateProduct
);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
