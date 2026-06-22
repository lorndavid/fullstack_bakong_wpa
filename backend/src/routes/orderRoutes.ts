import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.put('/admin/:id/status', protect, authorize('admin'), updateOrderStatus);
router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

export default router;
