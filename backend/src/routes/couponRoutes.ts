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
} from '../controllers/couponController';
import { protect, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// ─── Public / User Routes ─────────────────────────────────────────

router.get('/available', protect, getUserCoupons);
router.get('/auto-apply', getAutoApplyCoupons);
router.get('/highlighted', getHighlightedCoupons);
router.get('/code/:code', getCouponByCode);
router.post('/validate', validateCoupon);
router.post('/apply', protect, applyCoupon);

// ─── Admin Routes ────────────────────────────────────────────────

router.get('/admin/all', protect, authorize('admin'), getCoupons);
router.get('/admin/analytics', protect, authorize('admin'), getCouponAnalytics);
router.get('/admin/:id', protect, authorize('admin'), getCoupon);
router.get('/admin/:id/analytics', protect, authorize('admin'), getSingleCouponAnalytics);
router.post('/admin', protect, authorize('admin'), upload.single('bannerImage'), createCoupon);
router.put('/admin/:id', protect, authorize('admin'), upload.single('bannerImage'), updateCoupon);
router.patch('/admin/:id/status', protect, authorize('admin'), updateCouponStatus);
router.delete('/admin/:id', protect, authorize('admin'), deleteCoupon);

export default router;
