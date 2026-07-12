import { Router } from 'express';
import {
  getMyNotifications,
  getUnreadCountHandler,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  getAllNotifications,
  getNotificationStats,
  createNotification,
  adminDeleteNotification,
} from '../controllers/notificationController';
import { protect, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createNotificationSchema } from '../validators';

const router = Router();

// ─── User routes ───────────────────────────────────────────────
router.get('/', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCountHandler);
router.put('/:id/read', protect, markNotificationRead);
router.put('/read-all', protect, markAllRead);
router.delete('/:id', protect, deleteNotification);

// ─── Admin routes ──────────────────────────────────────────────
router.get('/admin/all', protect, authorize('admin'), getAllNotifications);
router.get('/admin/stats', protect, authorize('admin'), getNotificationStats);
router.post('/admin/create', protect, authorize('admin'), validate(createNotificationSchema), createNotification);
router.delete('/admin/:id', protect, authorize('admin'), adminDeleteNotification);

export default router;
