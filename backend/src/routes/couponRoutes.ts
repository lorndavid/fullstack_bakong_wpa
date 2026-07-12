import { Router } from 'express';
import {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  updateCouponStatus,
  getCouponAnalytics,
  getSingleCouponAnalytics,
  getUserCoupons,
  getAutoApplyCoupons,
  validateCoupon,
  applyCoupon,
  getCouponByCode,
  getHighlightedCoupons,
  findBestCoupon,
} from '../controllers/couponController';
import { protect, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { validate } from '../middlewares/validate';
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
  applyCouponSchema,
  findBestCouponSchema,
  updateCouponStatusSchema,
} from '../validators';

const router = Router();

// ─── Public / User Routes ─────────────────────────────────────────

router.get('/available', protect, getUserCoupons);
router.get('/auto-apply', getAutoApplyCoupons);
router.get('/highlighted', getHighlightedCoupons);
router.get('/code/:code', getCouponByCode);
router.post('/validate', validate(validateCouponSchema), validateCoupon);
router.post('/apply', protect, validate(applyCouponSchema), applyCoupon);
router.post('/best-coupon', validate(findBestCouponSchema), findBestCoupon);

// ─── Admin Routes ────────────────────────────────────────────────

router.get('/admin/all', protect, authorize('admin'), getCoupons);
router.get('/admin/analytics', protect, authorize('admin'), getCouponAnalytics);
router.get('/admin/:id', protect, authorize('admin'), getCoupon);
router.get('/admin/:id/analytics', protect, authorize('admin'), getSingleCouponAnalytics);
router.post('/admin', protect, authorize('admin'), upload.single('bannerImage'), validate(createCouponSchema), createCoupon);
router.put('/admin/:id', protect, authorize('admin'), upload.single('bannerImage'), validate(updateCouponSchema), updateCoupon);
router.patch('/admin/:id/status', protect, authorize('admin'), validate(updateCouponStatusSchema), updateCouponStatus);
router.delete('/admin/:id', protect, authorize('admin'), deleteCoupon);

export default router;
