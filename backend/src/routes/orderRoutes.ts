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
import { validate } from '../middlewares/validate';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  bulkDeleteOrdersSchema,
} from '../validators';

const router = Router();

router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.delete('/admin/:id', protect, authorize('admin'), deleteOrder);
router.post('/admin/bulk-delete', protect, authorize('admin'), validate(bulkDeleteOrdersSchema), bulkDeleteOrders);
router.put('/admin/:id/status', protect, authorize('admin'), validate(updateOrderStatusSchema), updateOrderStatus);
router.post('/', protect, validate(createOrderSchema), createOrder);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

export default router;
