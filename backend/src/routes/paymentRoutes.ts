import { Router } from 'express';
import {
  createPayment,
  checkPaymentStatus,
  saveTransaction,
  updatePaymentStatus,
  handleWebhook,
  subscribePayment,
  getAllTransactions,
  deleteTransaction,
  paymentStream,
} from '../controllers/paymentController';
import { protect, authorize } from '../middlewares/auth';

const router = Router();

// POST /api/payment/create - Create a KHQR payment (public)
router.post('/create', createPayment);

// GET /api/payment/status/:md5 - Check payment status by MD5 hash (public)
router.get('/status/:md5', checkPaymentStatus);

// POST /api/payment/webhook - Webhook for Bakong/third-party (public)
router.post('/webhook', handleWebhook);

// POST /api/payment/save - Save a transaction from frontend (public)
router.post('/save', saveTransaction);

// PUT /api/payment/status/:md5 - Update transaction status from frontend polling (public)
router.put('/status/:md5', updatePaymentStatus);

// GET /api/payment/subscribe/:md5 - SSE for frontend payment push (public)
router.get('/subscribe/:md5', subscribePayment);

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
