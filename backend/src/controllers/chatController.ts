import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Conversation, Message } from '../models/Chat';
import User from '../models/User';
import { uploadToCloudinary } from '../services/cloudinary';

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
      res.json({ success: true, conversation });
      return;
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
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

    res.status(201).json({ success: true, conversation });
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

    res.json({ success: true, conversations });
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
      res.status(404).json({ success: false, message: 'Conversation not found' });
      return;
    }

    // Verify access
    const isUser = conversation.userId.toString() === req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    if (!isUser && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized' });
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

    res.json({ success: true, messages });
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
      res.status(404).json({ success: false, message: 'Conversation not found' });
      return;
    }

    if (conversation.status === 'closed') {
      res.status(400).json({ success: false, message: 'Conversation is closed' });
      return;
    }

    const isUser = conversation.userId.toString() === req.user!.id;
    const isAdmin = req.user!.role === 'admin';
    if (!isUser && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized' });
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

    res.status(201).json({ success: true, message });
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
      res.status(400).json({ success: false, message: 'No file uploaded' });
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

    res.json({
      success: true,
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

    res.json({ success: true, conversations });
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
      res.status(404).json({ success: false, message: 'Admin not found' });
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
      res.status(404).json({ success: false, message: 'Conversation not found' });
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

    res.json({ success: true, conversation });
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
      res.status(404).json({ success: false, message: 'Conversation not found' });
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

    res.json({ success: true, conversation });
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

    res.json({
      success: true,
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
