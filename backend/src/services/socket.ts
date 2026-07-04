import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/generateToken';
import { Conversation, Message } from '../models/Chat';
import { getAutoReply, getWelcomeMessage } from './autoResponder';

let io: Server;

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  userName?: string;
}

export function initSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_USER_URL || 'http://localhost:5173',
        process.env.FRONTEND_ADMIN_URL || 'http://localhost:5174',
      ],
      credentials: true,
    },
  });

  // ─── Authentication middleware ────────────────────────────────
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = verifyAccessToken(token as string);
      socket.userId = decoded.id;
      socket.userRole = decoded.role || 'user';
      socket.userName = decoded.name || 'User';
      next();
    } catch {
      return next(new Error('Invalid or expired token'));
    }
  });

  // ─── Connection handler ───────────────────────────────────────
  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const userRole = socket.userRole!;
    const userName = socket.userName!;

    // Join user's personal room for targeted events
    socket.join(`user:${userId}`);

    // Join admin notification room if admin
    if (userRole === 'admin') {
      socket.join('admin:notifications');
    }

    // ── Join conversation room ──────────────────────────────────
    socket.on('chat:join', async (conversationId: string) => {
      try {
        // Verify access
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const isUser = conversation.userId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isUser && !isAdmin) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);

        // Mark messages as read if admin is viewing
        if (isAdmin) {
          await Message.updateMany(
            { conversationId, sender: 'user', read: false },
            { read: true }
          );
          await Conversation.findByIdAndUpdate(conversationId, { unreadCount: 0 });
          io.to(`conversation:${conversationId}`).emit('chat:read', {
            conversationId,
            readBy: userId,
          });
          // Notify admin list to refresh unread counts
          io.to('admin:notifications').emit('admin:unread-update', { conversationId, unreadCount: 0 });
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // ── Leave conversation room ─────────────────────────────────
    socket.on('chat:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // ── Send message ────────────────────────────────────────────
    socket.on('chat:send', async (data: {
      conversationId: string;
      content: string;
      messageType?: 'text' | 'file';
      fileUrl?: string;
      fileName?: string;
    }) => {
      try {
        const conversation = await Conversation.findById(data.conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (conversation.status === 'closed') {
          socket.emit('error', { message: 'This conversation is closed' });
          return;
        }

        const isUser = conversation.userId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isUser && !isAdmin) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        const senderRole = isUser ? 'user' : 'admin';

        // If user is sending and conversation is waiting, set to active
        if (isUser && conversation.status === 'waiting') {
          conversation.status = 'active';
          await conversation.save();
          io.to('admin:notifications').emit('admin:conversation-updated', {
            _id: conversation._id,
            status: 'active',
          });
        }

        // Auto-assign admin when they send their first message in a conversation
        if (isAdmin && !conversation.assignedTo) {
          conversation.assignedTo = { adminId: userId, adminName: userName };
          if (conversation.status === 'waiting') {
            conversation.status = 'active';
          }
          await conversation.save();
          io.to(`conversation:${data.conversationId}`).emit('chat:assigned', {
            conversationId: data.conversationId,
            assignedTo: { adminId: userId, adminName: userName },
          });
          io.to('admin:notifications').emit('admin:conversation-updated', conversation.toObject());

          // System message about assignment
          const assignMsg = await Message.create({
            conversationId: data.conversationId,
            sender: 'system',
            senderId: 'system',
            senderName: 'System',
            content: `${userName} is now assisting`,
            messageType: 'system',
            read: false,
          });
          io.to(`conversation:${data.conversationId}`).emit('chat:message', assignMsg.toObject());
        }

        const message = await Message.create({
          conversationId: data.conversationId,
          sender: senderRole,
          senderId: userId,
          senderName: isUser ? conversation.userName : (userName || (data as any).senderName || 'Admin'),
          content: data.content,
          messageType: data.messageType || 'text',
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          read: isAdmin, // Messages from admin are pre-read for the admin
        });

        // Update conversation metadata
        conversation.lastMessage = data.content.substring(0, 200);
        conversation.lastMessageAt = new Date();
        if (senderRole === 'user') {
          conversation.unreadCount += 1;
        }
        await conversation.save();

        // Emit message to conversation room
        io.to(`conversation:${data.conversationId}`).emit('chat:message', message.toObject());

        // Notify admin list about new message
        if (senderRole === 'user') {
          io.to('admin:notifications').emit('admin:new-message', {
            conversationId: data.conversationId,
            lastMessage: data.content.substring(0, 200),
            lastMessageAt: message.createdAt,
            unreadCount: conversation.unreadCount,
          });

          // ── Auto-responder ──────────────────────────────────
          // Determine the reply — use welcome message if first greeting, otherwise use auto-reply
          const reply = !conversation.greeted
            ? getWelcomeMessage()
            : getAutoReply(data.content);

          if (reply) {
            // Mark as greeted
            if (!conversation.greeted) {
              conversation.greeted = true;
              await conversation.save();
            }

            // Send typing indicator before replying (natural feel)
            io.to(`conversation:${data.conversationId}`).emit('chat:typing', {
              conversationId: data.conversationId,
              userId: 'system',
              userName: '🤖 Assistant',
              isTyping: true,
            });

            // Small delay to simulate typing (500ms-800ms)
            const typingDelay = 600 + Math.random() * 400;
            setTimeout(async () => {
              // Stop typing
              io.to(`conversation:${data.conversationId}`).emit('chat:typing', {
                conversationId: data.conversationId,
                userId: 'system',
                userName: '🤖 Assistant',
                isTyping: false,
              });

              // Small extra pause before message appears
              await new Promise(r => setTimeout(r, 200));

              const autoMsg = await Message.create({
                conversationId: data.conversationId,
                sender: 'system',
                senderId: 'system',
                senderName: '🤖 Assistant',
                content: reply,
                messageType: 'text',
                read: false,
              });

              // Update conversation metadata
              conversation.lastMessage = reply.substring(0, 200);
              conversation.lastMessageAt = new Date();
              conversation.unreadCount += 1;
              await conversation.save();

              io.to(`conversation:${data.conversationId}`).emit('chat:message', autoMsg.toObject());

              // Notify admin
              io.to('admin:notifications').emit('admin:new-message', {
                conversationId: data.conversationId,
                lastMessage: reply.substring(0, 200),
                lastMessageAt: autoMsg.createdAt,
                unreadCount: conversation.unreadCount,
              });
            }, typingDelay);
          }
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── Mark as read ────────────────────────────────────────────
    socket.on('chat:mark-read', async (conversationId: string) => {
      if (userRole !== 'admin') return;
      try {
        await Message.updateMany(
          { conversationId, sender: 'user', read: false },
          { read: true }
        );
        await Conversation.findByIdAndUpdate(conversationId, { unreadCount: 0 });
        io.to(`conversation:${conversationId}`).emit('chat:read', {
          conversationId,
          readBy: userId,
        });
        io.to('admin:notifications').emit('admin:unread-update', { conversationId, unreadCount: 0 });
      } catch {
        // silent
      }
    });

    // ── Typing indicator ────────────────────────────────────────
    socket.on('chat:typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conversation:${data.conversationId}`).emit('chat:typing', {
        conversationId: data.conversationId,
        userId,
        userName,
        isTyping: data.isTyping,
      });
    });        // ── Admin: Assign staff ─────────────────────────────────────
    socket.on('admin:assign', async (data: { conversationId: string; adminId: string; adminName: string }) => {
      if (userRole !== 'admin') return;
      try {
        const conversation = await Conversation.findByIdAndUpdate(
          data.conversationId,
          {
            assignedTo: { adminId: data.adminId, adminName: data.adminName },
            status: 'active',
          },
          { new: true }
        );
        if (!conversation) return;

        const content = `Assigned to ${data.adminName}`;
        conversation.lastMessage = content;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const sysMsg = await Message.create({
          conversationId: data.conversationId,
          sender: 'system',
          senderId: 'system',
          senderName: 'System',
          content,
          messageType: 'system',
          read: false,
        });

        io.to(`conversation:${data.conversationId}`).emit('chat:message', sysMsg.toObject());
        io.to(`conversation:${data.conversationId}`).emit('chat:assigned', {
          conversationId: data.conversationId,
          assignedTo: { adminId: data.adminId, adminName: data.adminName },
        });
        io.to('admin:notifications').emit('admin:conversation-updated', conversation.toObject());
      } catch {
        socket.emit('error', { message: 'Failed to assign staff' });
      }
    });        // ── Admin: Close conversation ───────────────────────────────
    socket.on('admin:close', async (conversationId: string) => {
      if (userRole !== 'admin') return;
      try {
        const conversation = await Conversation.findByIdAndUpdate(
          conversationId,
          { status: 'closed', assignedTo: undefined },
          { new: true }
        );
        if (!conversation) return;

        const content = 'Conversation closed';
        conversation.lastMessage = content;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const sysMsg = await Message.create({
          conversationId,
          sender: 'system',
          senderId: 'system',
          senderName: 'System',
          content,
          messageType: 'system',
          read: false,
        });

        io.to(`conversation:${conversationId}`).emit('chat:message', sysMsg.toObject());
        io.to(`conversation:${conversationId}`).emit('chat:closed', { conversationId });
        io.to('admin:notifications').emit('admin:conversation-updated', conversation.toObject());
      } catch {
        socket.emit('error', { message: 'Failed to close conversation' });
      }
    });

    // ── Notification: Mark as read via socket ───────────────────
    socket.on('notification:mark-read', async (notificationId: string) => {
      try {
        const { markAsRead } = await import('./notificationService');
        await markAsRead(notificationId, userId);
        io.to(`user:${userId}`).emit('notification:updated', {
          notificationId,
          read: true,
        });
      } catch {
        // silent
      }
    });

    // ── Notification: Mark all as read via socket ───────────────
    socket.on('notification:mark-all-read', async () => {
      try {
        const { markAllAsRead } = await import('./notificationService');
        await markAllAsRead(userId);
        io.to(`user:${userId}`).emit('notification:all-read');
      } catch {
        // silent
      }
    });

    // ── Disconnect ──────────────────────────────────────────────
    socket.on('disconnect', () => {
      // Cleanup is handled automatically by Socket.IO
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export { AuthenticatedSocket };
