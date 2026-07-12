import { Router } from 'express';
import { protect, protectWithRateLimit, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import { sendMessageSchema, assignStaffSchema, mongoIdParam, paginationQuery } from '../validators';
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
router.get('/conversations', protect, validateQuery(paginationQuery), getUserConversations);
router.get('/conversations/:id/messages', protect, validateParams(mongoIdParam), validateQuery(paginationQuery), getMessages);
router.post('/conversations/:id/messages', protectWithRateLimit, validateParams(mongoIdParam), validate(sendMessageSchema), sendMessage);
router.post('/upload', protectWithRateLimit, upload.single('file'), uploadFile);

// ─── Admin routes ────────────────────────────────────────────────
router.get('/admin/conversations', protectWithRateLimit, authorize('admin'), validateQuery(paginationQuery), getAdminConversations);
router.get('/admin/conversations/:id/messages', protectWithRateLimit, authorize('admin'), validateParams(mongoIdParam), validateQuery(paginationQuery), getMessages);
router.patch('/admin/conversations/:id/assign', protectWithRateLimit, authorize('admin'), validateParams(mongoIdParam), validate(assignStaffSchema), assignStaff);
router.patch('/admin/conversations/:id/close', protectWithRateLimit, authorize('admin'), validateParams(mongoIdParam), closeConversation);
router.get('/admin/stats', protectWithRateLimit, authorize('admin'), getChatStats);

export default router;
