import mongoose, { Schema, Document } from 'mongoose';

// ─── Message Interface ────────────────────────────────────────────
export interface IMessage {
  sender: 'user' | 'admin';
  senderId: string;
  senderName: string;
  content: string;
  messageType: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  read: boolean;
  createdAt: Date;
}

export interface IMessageDocument extends Document {
  conversationId: mongoose.Types.ObjectId;
  sender: 'user' | 'admin';
  senderId: string;
  senderName: string;
  content: string;
  messageType: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Conversation Interface ────────────────────────────────────────
export interface IConversation {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  assignedTo?: {
    adminId: string;
    adminName: string;
  };
  status: 'active' | 'waiting' | 'closed';
  greeted: boolean;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  assignedTo?: {
    adminId: string;
    adminName: string;
  };
  status: 'active' | 'waiting' | 'closed';
  greeted: boolean;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Message Schema ────────────────────────────────────────────────
const messageSchema = new Schema<IMessageDocument>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation ID is required'],
    },
    sender: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'system'],
      default: 'text',
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

// ─── Conversation Schema ───────────────────────────────────────────
const conversationSchema = new Schema<IConversationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
    },
    assignedTo: {
      adminId: { type: String },
      adminName: { type: String },
    },
    status: {
      type: String,
      enum: ['active', 'waiting', 'closed'],
      default: 'waiting',
    },
    greeted: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: String,
      maxlength: 200,
    },
    lastMessageAt: {
      type: Date,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ userId: 1, status: 1 });
conversationSchema.index({ status: 1, lastMessageAt: -1 });

// ─── Auto-update lastMessageAt on save ─────────────────────────────
conversationSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'closed') {
    this.assignedTo = undefined;
  }
  next();
});

export const Message = mongoose.model<IMessageDocument>('Message', messageSchema);
export const Conversation = mongoose.model<IConversationDocument>('Conversation', conversationSchema);
