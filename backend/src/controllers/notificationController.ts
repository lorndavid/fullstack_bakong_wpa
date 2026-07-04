import { Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../types';
import {
  createAndSendNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../services/notificationService';

// ─── User: Get my notifications ────────────────────────────────
const getMyNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === 'true';

    const filter: Record<string, any> = { user: req.user!.id };
    if (unreadOnly) filter.read = false;

    const [notifications, total, unread] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      getUnreadCount(req.user!.id),
    ]);

    res.json({
      success: true,
      notifications,
      unreadCount: unread,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── User: Get unread count ────────────────────────────────────
const getUnreadCountHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const count = await getUnreadCount(req.user!.id);
    res.json({ success: true, unreadCount: count });
  } catch (error) {
    next(error);
  }
};

// ─── User: Mark as read ────────────────────────────────────────
const markNotificationRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const success = await markAsRead(req.params.id, req.user!.id);
    if (!success) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

// ─── User: Mark all as read ────────────────────────────────────
const markAllRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await markAllAsRead(req.user!.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// ─── User: Delete a notification ───────────────────────────────
const deleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notif = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.id,
    });
    if (!notif) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Get all notifications (for management) ─────────────
const getAllNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;

    const filter: Record<string, any> = {};
    if (type) filter.type = type;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    res.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Get notification stats ─────────────────────────────
const getNotificationStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const total = await Notification.countDocuments();
    const unread = await Notification.countDocuments({ read: false });
    const sentToday = await Notification.countDocuments({
      sentAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });
    const byType = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const scheduled = await Notification.countDocuments({
      scheduledFor: { $gte: new Date() },
      sentAt: null,
    });

    res.json({
      success: true,
      stats: {
        total,
        unread,
        sentToday,
        scheduled,
        byType: byType.map((t: any) => ({ type: t._id, count: t.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Create notification / broadcast ────────────────────
const createNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      type = 'admin_broadcast',
      title,
      message,
      data,
      link,
      channels = ['in_app'],
      scheduledFor,
      expiresAt,
      audience, // 'all_users' | 'all_admins' | single userId
      userId, // if audience is a single user
    } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, message: 'Title and message are required' });
      return;
    }

    let recipient: any;

    switch (audience) {
      case 'all_admins':
        recipient = { role: 'admin' };
        break;
      case 'single_user':
        if (!userId) {
          res.status(400).json({ success: false, message: 'userId is required for single_user audience' });
          return;
        }
        recipient = { userId };
        break;
      default:
        recipient = { allUsers: true };
    }

    const notifications = await createAndSendNotification({
      recipient,
      type: type as any,
      title,
      message,
      data: data || {},
      link: link || '',
      channels,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    res.status(201).json({
      success: true,
      message: `Notification sent to ${notifications.length} user(s)`,
      count: notifications.length,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Delete any notification ────────────────────────────
const adminDeleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const notif = await Notification.findByIdAndDelete(req.params.id);
    if (!notif) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

export {
  getMyNotifications,
  getUnreadCountHandler,
  markNotificationRead,
  markAllRead,
  deleteNotification,
  getAllNotifications,
  getNotificationStats,
  createNotification,
  adminDeleteNotification,
};
