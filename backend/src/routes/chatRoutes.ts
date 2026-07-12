import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth';
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
router.post('/conversations/:id/messages', protect, validateParams(mongoIdParam), validate(sendMessageSchema), sendMessage);
router.post('/upload', protect, upload.single('file'), uploadFile);

// ─── Admin routes ────────────────────────────────────────────────
router.get('/admin/conversations', protect, authorize('admin'), validateQuery(paginationQuery), getAdminConversations);
router.get('/admin/conversations/:id/messages', protect, authorize('admin'), validateParams(mongoIdParam), validateQuery(paginationQuery), getMessages);
router.patch('/admin/conversations/:id/assign', protect, authorize('admin'), validateParams(mongoIdParam), validate(assignStaffSchema), assignStaff);
router.patch('/admin/conversations/:id/close', protect, authorize('admin'), validateParams(mongoIdParam), closeConversation);
router.get('/admin/stats', protect, authorize('admin'), getChatStats);

export default router;
