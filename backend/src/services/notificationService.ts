import Notification from '../models/Notification';
import User from '../models/User';
import { getIO } from './socket';
import { INotificationDocument, NotificationType } from '../models/Notification';

type NotificationRecipient =
  | { userId: string }
  | { allUsers: true }
  | { role: 'user' | 'admin' };

interface CreateNotificationOptions {
  recipient: NotificationRecipient;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  link?: string;
  channels?: ('in_app' | 'email' | 'push')[];
  scheduledFor?: Date;
  expiresAt?: Date;
}

/**
 * Create a notification and deliver it through the specified channels.
 */
export async function createAndSendNotification(
  options: CreateNotificationOptions
): Promise<any[]> {
  const {
    recipient,
    type,
    title,
    message,
    data = {},
    link = '',
    channels = ['in_app'],
    scheduledFor,
    expiresAt,
  } = options;

  const notifications: INotificationDocument[] = [];

  // Determine target user IDs
  let userIds: string[] = [];

  if ('userId' in recipient) {
    userIds = [recipient.userId];
  } else if ('allUsers' in recipient) {
    const users = await User.find({ role: 'user' }).select('_id email name').lean();
    userIds = users.map((u: any) => u._id.toString());
  } else if ('role' in recipient) {
    const users = await User.find({ role: recipient.role }).select('_id email name').lean();
    userIds = users.map((u: any) => u._id.toString());
  }

  if (userIds.length === 0) {
    return [];
  }

  // For broadcasts to many users, insert in bulk
  if (userIds.length > 1 && channels.includes('in_app')) {
    const notificationsToInsert = userIds.map((uid) => ({
      user: uid,
      type,
      title,
      message,
      data,
      link,
      channels,
      read: false,
      scheduledFor: scheduledFor || undefined,
      expiresAt: expiresAt || undefined,
      sentAt: scheduledFor ? undefined : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const inserted = await Notification.insertMany(notificationsToInsert as any);
    // Cast to any to avoid type conflicts with insertMany return types
    const insertedDocs = inserted as unknown as INotificationDocument[];
    notifications.push(...insertedDocs);

    // Send real-time to each user (only if not scheduled)
    if (!scheduledFor) {
      const io = getIO();
      for (const notif of insertedDocs) {
        const notifObj = notif.toObject();
        const uid = notif.user?.toString();
        if (uid) {
          io.to(`user:${uid}`).emit('notification:new', notifObj);
        }
      }
    }
  } else {
    // Single user or few users
    for (const uid of userIds) {
      const notification = await Notification.create({
        user: uid,
        type,
        title,
        message,
        data,
        link,
        channels,
        read: false,
        scheduledFor: scheduledFor || undefined,
        expiresAt: expiresAt || undefined,
        sentAt: scheduledFor ? undefined : new Date(),
      });

      notifications.push(notification);

      // Send in-app (socket)
      if (channels.includes('in_app') && !scheduledFor) {
        try {
          const io = getIO();
          io.to(`user:${uid}`).emit('notification:new', notification.toObject());
        } catch {
          // Socket not available
        }
      }

      // Send email
      if (channels.includes('email')) {
        try {
          const user = await User.findById(uid).select('email name').lean();
          if (user && (user as any).email) {
            await sendEmailNotification(
              (user as any).email,
              (user as any).name || 'Customer',
              type,
              title,
              message,
              link
            );
          }
        } catch {
          console.warn(`[Notifications] Failed to send email to user ${uid}`);
        }
      }
    }
  }

  return notifications;
}

/**
 * Mark a notification as read.
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const result = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true, readAt: new Date() },
    { new: true }
  );
  return !!result;
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(userId: string): Promise<void> {
  await Notification.updateMany(
    { user: userId, read: false },
    { read: true, readAt: new Date() }
  );
}

/**
 * Get unread count for a user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ user: userId, read: false });
}

/**
 * Send an email notification.
 * Uses the existing email config (if available) via nodemailer or console fallback.
 */
async function sendEmailNotification(
  email: string,
  name: string,
  type: string,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.log(`[Notifications] Email would be sent to ${email}: ${title} — ${message}`);
    return;
  }

  const emailSubject = mapNotificationTypeToSubject(type, title);
  const emailHtml = buildEmailHtml(name, title, message, link);    const from = process.env.EMAIL_FROM || 'noreply@myshop.com';
    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });
    console.log(`[Notifications] ✅ Email sent to ${email}`);
  } catch (err: any) {
    console.warn(`[Notifications] ⚠️ Email send failed: ${err.message}`);
  }
}

/**
 * Get nodemailer transporter or null if not configured.
 */
function getEmailTransporter() {
  try {
    const nodemailer = require('nodemailer');
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT || '587');
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const from = process.env.EMAIL_FROM || 'noreply@myshop.com';

    if (!host || !user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } catch {
    return null;
  }
}

function mapNotificationTypeToSubject(type: string, title: string): string {
  const subjects: Record<string, string> = {
    order_confirmed: '✅ Order Confirmed — MY SHOP',
    payment_successful: '💳 Payment Successful — MY SHOP',
    shipping_update: '🚚 Shipping Update — MY SHOP',
    flash_sale: '⚡ Flash Sale Alert — MY SHOP',
    new_coupon: '🎉 New Coupon Available — MY SHOP',
    wishlist_price_drop: '💰 Price Drop Alert — MY SHOP',
    admin_broadcast: '📢 Announcement — MY SHOP',
  };
  return subjects[type] || title;
}

function buildEmailHtml(name: string, title: string, message: string, link?: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 32px 24px 0; text-align: center;">
              <h2 style="margin: 0; font-size: 16px; color: #333;">MY SHOP</h2>
              <h1 style="margin: 16px 0 8px; font-size: 20px; color: #1a1a1a;">${title}</h1>
              <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">${message}</p>
              ${link ? `<a href="${link}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">View Details</a>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding: 24px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 11px; color: #999;">© ${new Date().getFullYear()} MY SHOP. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ─── Scheduled notification processor ─────────────────────────

/**
 * Process scheduled notifications that are due.
 * Call this on server startup and periodically.
 */
export async function processScheduledNotifications(): Promise<void> {
  try {
    const now = new Date();
    const due = await Notification.find({
      scheduledFor: { $lte: now },
      sentAt: null,
    }).limit(100);

    if (due.length === 0) return;

    const io = getIO();
    for (const notif of due) {
      notif.sentAt = now;
      await notif.save();

      if (notif.user) {
        io.to(`user:${notif.user}`).emit('notification:new', notif.toObject());
      }
    }

    console.log(`[Notifications] ⏰ Processed ${due.length} scheduled notification(s)`);
  } catch (err: any) {
    console.warn(`[Notifications] ⚠️ Scheduled processing error: ${err.message}`);
  }
}
