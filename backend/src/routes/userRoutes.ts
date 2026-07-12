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
import { validate } from '../middlewares/validate';
import {
  updateUserSchema,
  createAdminUserSchema,
  bulkDeleteUsersSchema,
} from '../validators';

const router = Router();

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id', protect, authorize('admin'), validate(updateUserSchema), updateUser);
router.get('/:id/orders', protect, authorize('admin'), getUserOrders);
router.get('/:id/login-history', protect, authorize('admin'), getUserLoginHistory);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.delete('/bulk/delete', protect, authorize('admin'), validate(bulkDeleteUsersSchema), bulkDeleteUsers);
router.post('/create-admin', protect, authorize('admin'), validate(createAdminUserSchema), createAdminUser);
router.get('/permissions/list', protect, authorize('admin'), getPermissionsList);

export default router;
