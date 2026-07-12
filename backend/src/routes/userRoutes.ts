import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserOrders,
  getUserLoginHistory,
  getDashboardStats,
  createAdminUser,
  bulkDeleteUsers,
  getPermissionsList,
} from '../controllers/userController';
import { protectWithRateLimit, authorize } from '../middlewares/auth';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import {
  updateUserSchema,
  createAdminUserSchema,
  bulkDeleteUsersSchema,
  mongoIdParam,
  paginationQuery,
} from '../validators';

const router = Router();

router.get('/stats', protectWithRateLimit, authorize('admin'), getDashboardStats);
router.get('/', protectWithRateLimit, authorize('admin'), validateQuery(paginationQuery), getUsers);
router.get('/:id', protectWithRateLimit, authorize('admin'), validateParams(mongoIdParam), getUser);
router.put('/:id', protectWithRateLimit, authorize('admin'), validateParams(mongoIdParam), validate(updateUserSchema), updateUser);
router.get('/:id/orders', protectWithRateLimit, authorize('admin'), validateParams(mongoIdParam), validateQuery(paginationQuery), getUserOrders);
router.get('/:id/login-history', protectWithRateLimit, authorize('admin'), validateParams(mongoIdParam), validateQuery(paginationQuery), getUserLoginHistory);
router.delete('/:id', protectWithRateLimit, authorize('admin'), validateParams(mongoIdParam), deleteUser);
router.delete('/bulk/delete', protectWithRateLimit, authorize('admin'), validate(bulkDeleteUsersSchema), bulkDeleteUsers);
router.post('/create-admin', protectWithRateLimit, authorize('admin'), validate(createAdminUserSchema), createAdminUser);
router.get('/permissions/list', protectWithRateLimit, authorize('admin'), getPermissionsList);

export default router;
