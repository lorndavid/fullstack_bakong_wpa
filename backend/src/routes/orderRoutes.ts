import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  bulkDeleteOrders,
} from '../controllers/orderController';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.delete('/admin/:id', protect, authorize('admin'), deleteOrder);
router.post('/admin/bulk-delete', protect, authorize('admin'), bulkDeleteOrders);
router.put('/admin/:id/status', protect, authorize('admin'), updateOrderStatus);
router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

export default router;
