import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginHistoryDocument extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'login' | 'logout' | 'google_login' | 'token_refresh';
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const loginHistorySchema = new Schema<ILoginHistoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    action: {
      type: String,
      enum: ['login', 'logout', 'google_login', 'token_refresh'],
      required: [true, 'Action is required'],
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries by userId sorted by time
loginHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ILoginHistoryDocument>('LoginHistory', loginHistorySchema);
