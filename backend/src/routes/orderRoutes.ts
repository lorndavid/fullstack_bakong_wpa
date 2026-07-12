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
import { protect, protectWithRateLimit, authorize } from '../middlewares/auth';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  bulkDeleteOrdersSchema,
  mongoIdParam,
  paginationQuery,
} from '../validators';

const router = Router();

router.get('/admin/all', protectWithRateLimit, authorize('admin'), validateQuery(paginationQuery), getAllOrders);
router.delete('/admin/:id', protectWithRateLimit, authorize('admin'), validateParams(mongoIdParam), deleteOrder);
router.post('/admin/bulk-delete', protectWithRateLimit, authorize('admin'), validate(bulkDeleteOrdersSchema), bulkDeleteOrders);
router.put('/admin/:id/status', protectWithRateLimit, authorize('admin'), validateParams(mongoIdParam), validate(updateOrderStatusSchema), updateOrderStatus);
router.post('/', protectWithRateLimit, validate(createOrderSchema), createOrder);
router.get('/', protect, validateQuery(paginationQuery), getMyOrders);
router.get('/:id', protect, validateParams(mongoIdParam), getOrder);
router.put('/:id/cancel', protectWithRateLimit, validateParams(mongoIdParam), cancelOrder);

export default router;
