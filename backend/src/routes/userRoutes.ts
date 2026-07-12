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
import { protect, authorize } from '../middlewares/auth';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import {
  updateUserSchema,
  createAdminUserSchema,
  bulkDeleteUsersSchema,
  mongoIdParam,
  paginationQuery,
} from '../validators';

const router = Router();

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/', protect, authorize('admin'), validateQuery(paginationQuery), getUsers);
router.get('/:id', protect, authorize('admin'), validateParams(mongoIdParam), getUser);
router.put('/:id', protect, authorize('admin'), validateParams(mongoIdParam), validate(updateUserSchema), updateUser);
router.get('/:id/orders', protect, authorize('admin'), validateParams(mongoIdParam), validateQuery(paginationQuery), getUserOrders);
router.get('/:id/login-history', protect, authorize('admin'), validateParams(mongoIdParam), validateQuery(paginationQuery), getUserLoginHistory);
router.delete('/:id', protect, authorize('admin'), validateParams(mongoIdParam), deleteUser);
router.delete('/bulk/delete', protect, authorize('admin'), validate(bulkDeleteUsersSchema), bulkDeleteUsers);
router.post('/create-admin', protect, authorize('admin'), validate(createAdminUserSchema), createAdminUser);
router.get('/permissions/list', protect, authorize('admin'), getPermissionsList);

export default router;
