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
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  bulkDeleteOrdersSchema,
  mongoIdParam,
  paginationQuery,
} from '../validators';

const router = Router();

router.get('/admin/all', protect, authorize('admin'), validateQuery(paginationQuery), getAllOrders);
router.delete('/admin/:id', protect, authorize('admin'), validateParams(mongoIdParam), deleteOrder);
router.post('/admin/bulk-delete', protect, authorize('admin'), validate(bulkDeleteOrdersSchema), bulkDeleteOrders);
router.put('/admin/:id/status', protect, authorize('admin'), validateParams(mongoIdParam), validate(updateOrderStatusSchema), updateOrderStatus);
router.post('/', protect, validate(createOrderSchema), createOrder);
router.get('/', protect, validateQuery(paginationQuery), getMyOrders);
router.get('/:id', protect, validateParams(mongoIdParam), getOrder);
router.put('/:id/cancel', protect, validateParams(mongoIdParam), cancelOrder);

export default router;
