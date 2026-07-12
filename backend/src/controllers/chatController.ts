import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Conversation, Message } from '../models/Chat';
import User from '../models/User';
import { uploadToCloudinary } from '../services/cloudinary';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

// ─── User: Get or create conversation ────────────────────────────
export const getOrCreateConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Check if user has an active/waiting conversation
    let conversation = await Conversation.findOne({
      userId,
      status: { $ne: 'closed' },
    }).sort({ updatedAt: -1 });

    if (conversation) {
      sendSuccess(res, { conversation });
      return;
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Create new conversation
    conversation = await Conversation.create({
      userId,
      userName: user.name,
      userEmail: user.email,
      userAvatar: user.avatar,
      status: 'waiting',
    });

    sendCreated(res, { conversation });
  } catch (error) {
    next(error);
  }
};

// ─── User: Get my conversations ──────────────────────────────────
export const getUserConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const conversations = await Conversation.find({
      userId: req.user!.id,
    }).sort({ updatedAt: -1 });

    sendSuccess(res, { conversations });
  } catch (error) {
    next(error);
  }
};

// ─── Get messages for a conversation ────────────────────────────
export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      sendError(res, 'Conversation not found', 404);
      return;
    }

    // Verify access
    const isUser = conversation.userId.toString() === req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    if (!isUser && !isAdmin) {
      sendError(res, 'Not authorized', 403);
      return;
    }

    // If admin is viewing, mark user messages as read
    if (isAdmin) {
      await Message.updateMany(
        { conversationId: id, sender: 'user', read: false },
        { read: true }
      );
      await Conversation.findByIdAndUpdate(id, { unreadCount: 0 });
    }

    // Mark as read for user too
    if (isUser) {
      await Message.updateMany(
        { conversationId: id, sender: 'admin', read: false },
        { read: true }
      );
    }

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .limit(200);

    sendSuccess(res, { messages });
  } catch (error) {
    next(error);
  }
};

// ─── Send a message (REST fallback) ─────────────────────────────
export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, messageType = 'text', fileUrl, fileName } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      sendError(res, 'Conversation not found', 404);
      return;
    }

    if (conversation.status === 'closed') {
      sendError(res, 'Conversation is closed', 400);
      return;
    }

    const isUser = conversation.userId.toString() === req.user!.id;
    const isAdmin = req.user!.role === 'admin';
    if (!isUser && !isAdmin) {
      sendError(res, 'Not authorized', 403);
      return;
    }

    const senderRole = isUser ? 'user' : 'admin';
    const user = await User.findById(req.user!.id);

    const message = await Message.create({
      conversationId: id,
      sender: senderRole,
      senderId: req.user!.id,
      senderName: user?.name || 'Unknown',
      content: content || '',
      messageType: messageType as 'text' | 'file',
      fileUrl,
      fileName,
      read: isAdmin,
    });

    // Update conversation
    conversation.lastMessage = content?.substring(0, 200) || (fileUrl ? '📎 File uploaded' : '');
    conversation.lastMessageAt = new Date();
    if (senderRole === 'user') {
      conversation.unreadCount += 1;
      if (conversation.status === 'waiting') {
        conversation.status = 'active';
      }
    }
    await conversation.save();

    sendCreated(res, { message });
  } catch (error) {
    next(error);
  }
};

// ─── Upload file for chat ────────────────────────────────────────
export const uploadFile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file uploaded', 400);
      return;
    }

    let fileUrl: string;
    let fileName: string = req.file.originalname;

    // Upload to Cloudinary
    try {
      const result = await uploadToCloudinary(req.file, 'chat-files');
      fileUrl = result.secure_url;
    } catch {
      // Fallback to local storage
      const { saveFileLocally } = await import('../services/fileStorage');
      const localPath = saveFileLocally(req.file);
      fileUrl = localPath.secure_url;
    }

    sendSuccess(res, {
      fileUrl,
      fileName,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: List all conversations ───────────────────────────────
export const getAdminConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, search } = req.query;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const conversations = await Conversation.find(filter)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    sendSuccess(res, { conversations });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Assign staff to conversation ─────────────────────────
export const assignStaff = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const admin = await User.findById(adminId || req.user!.id);
    if (!admin) {
      sendError(res, 'Admin not found', 404);
      return;
    }

    const conversation = await Conversation.findByIdAndUpdate(
      id,
      {
        assignedTo: { adminId: admin._id.toString(), adminName: admin.name },
        status: 'active',
      },
      { new: true }
    );

    if (!conversation) {
      sendError(res, 'Conversation not found', 404);
      return;
    }

    // Add system message
    await Message.create({
      conversationId: id,
      sender: 'system',
      senderId: 'system',
      senderName: 'System',
      content: `Assigned to ${admin.name}`,
      messageType: 'system',
      read: false,
    });

    sendSuccess(res, { conversation });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Close conversation ───────────────────────────────────
export const closeConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { status: 'closed', assignedTo: undefined },
      { new: true }
    );

    if (!conversation) {
      sendError(res, 'Conversation not found', 404);
      return;
    }

    // Add system message
    await Message.create({
      conversationId: id,
      sender: 'system',
      senderId: 'system',
      senderName: 'System',
      content: 'Conversation closed',
      messageType: 'system',
      read: false,
    });

    sendSuccess(res, { conversation });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Get conversation stats ───────────────────────────────
export const getChatStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const total = await Conversation.countDocuments();
    const active = await Conversation.countDocuments({ status: 'active' });
    const waiting = await Conversation.countDocuments({ status: 'waiting' });
    const closed = await Conversation.countDocuments({ status: 'closed' });
    const unread = await Conversation.aggregate([
      { $match: { status: { $ne: 'closed' } } },
      { $group: { _id: null, total: { $sum: '$unreadCount' } } },
    ]);

    const messagesToday = await Message.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    sendSuccess(res, {
      stats: {
        total,
        active,
        waiting,
        closed,
        unread: unread[0]?.total || 0,
        messagesToday,
      },
    });
  } catch (error) {
    next(error);
  }
};
