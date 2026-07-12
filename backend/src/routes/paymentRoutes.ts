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
import { validate } from '../middlewares/validate';
import {
  createPaymentSchema,
  checkPaymentSchema,
  saveTransactionSchema,
  updatePaymentStatusSchema,
} from '../validators';

const router = Router();

// POST /api/payment/create - Create a payment (Bakong KHQR or ABA PayWay) (public)
router.post('/create', validate(createPaymentSchema), createPayment);

// POST /api/payment/check - Check payment status by tranId/md5 + provider (public)
router.post('/check', validate(checkPaymentSchema), checkPaymentStatus);

// Backward-compatible Bakong routes (keep for existing frontend)
router.get('/status/:md5', checkPaymentStatus);
router.post('/save', validate(saveTransactionSchema), saveTransaction);
router.put('/status/:md5', validate(updatePaymentStatusSchema), updatePaymentStatus);
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
