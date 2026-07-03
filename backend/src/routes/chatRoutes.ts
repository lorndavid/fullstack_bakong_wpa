import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  uploadFile,
  getAdminConversations,
  assignStaff,
  closeConversation,
  getChatStats,
} from '../controllers/chatController';

const router = Router();

// ─── User routes (authenticated) ─────────────────────────────────
router.get('/conversation', protect, getOrCreateConversation);
router.get('/conversations', protect, getUserConversations);
router.get('/conversations/:id/messages', protect, getMessages);
router.post('/conversations/:id/messages', protect, sendMessage);
router.post('/upload', protect, upload.single('file'), uploadFile);

// ─── Admin routes ────────────────────────────────────────────────
router.get('/admin/conversations', protect, authorize('admin'), getAdminConversations);
router.get('/admin/conversations/:id/messages', protect, authorize('admin'), getMessages);
router.patch('/admin/conversations/:id/assign', protect, authorize('admin'), assignStaff);
router.patch('/admin/conversations/:id/close', protect, authorize('admin'), closeConversation);
router.get('/admin/stats', protect, authorize('admin'), getChatStats);

export default router;
