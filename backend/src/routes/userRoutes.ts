import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getDashboardStats,
} from '../controllers/userController';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
