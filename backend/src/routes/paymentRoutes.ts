import { Router } from 'express';
import {
  createPayment,
  checkPaymentStatus,
  handleWebhook,
  subscribePayment,
  saveTransaction,
  updatePaymentStatus,
  getAllTransactions,
  deleteTransaction,
  paymentStream,
} from '../controllers/paymentController';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

// POST /api/payment/create - Create a payment (Bakong KHQR or ABA PayWay) (public)
router.post('/create', createPayment);

// POST /api/payment/check - Check payment status by tranId/md5 + provider (public)
router.post('/check', checkPaymentStatus);

// Backward-compatible Bakong routes (keep for existing frontend)
router.get('/status/:md5', checkPaymentStatus);
router.post('/save', saveTransaction);
router.put('/status/:md5', updatePaymentStatus);
router.get('/subscribe/:md5', subscribePayment);

// GET /api/payment/subscribe/:tranId - SSE for frontend payment push (public)
router.get('/subscribe/tran/:tranId', subscribePayment);

// POST /api/payment/webhook - Webhook for Bakong/third-party (public)
router.post('/webhook', handleWebhook);

// Admin-only routes below
router.get('/transactions', protect, authorize('admin'), getAllTransactions);
router.delete('/transactions/:id', protect, authorize('admin'), deleteTransaction);

// SSE stream — inject token from query param for EventSource compatibility
router.get('/stream', (req, _res, next) => {
  const token = req.query.token as string;
  if (token) req.headers.authorization = `Bearer ${token}`;
  next();
}, protect, authorize('admin'), paymentStream);

export default router;
