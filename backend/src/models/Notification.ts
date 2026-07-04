import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'order_confirmed'
  | 'payment_successful'
  | 'shipping_update'
  | 'flash_sale'
  | 'new_coupon'
  | 'wishlist_price_drop'
  | 'admin_broadcast';

export interface INotificationDocument extends Document {
  user?: mongoose.Types.ObjectId; // null for broadcasts
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>; // e.g. { orderId, productId, discountPercent, ... }
  link?: string; // deep link to relevant page
  read: boolean;
  readAt?: Date;
  channels: ('in_app' | 'email' | 'push')[];
  scheduledFor?: Date; // for scheduled notifications
  sentAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        'order_confirmed',
        'payment_successful',
        'shipping_update',
        'flash_sale',
        'new_coupon',
        'wishlist_price_drop',
        'admin_broadcast',
      ],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 1000,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    link: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    channels: {
      type: [String],
      enum: ['in_app', 'email', 'push'],
      default: ['in_app'],
    },
    scheduledFor: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ scheduledFor: 1 }, { sparse: true });

export default mongoose.model<INotificationDocument>('Notification', notificationSchema);
