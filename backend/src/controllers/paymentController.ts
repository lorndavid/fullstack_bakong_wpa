import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';
import Order from '../models/Order';
import Settings from '../models/Settings';
import QRCode from 'qrcode';
import { createKHQR, checkTransactionStatus } from '../services/bakong';
import { confirmPayment, paymentEvents } from '../services/paymentWatcher';
import { createPayment as serviceCreatePayment, checkPaymentByTransaction, confirmPayment as serviceConfirmPayment } from '../modules/payment/payment.service';
import { sendSuccess, sendError, sendCreated, sendDeleted } from '../utils/response';
import { AuthRequest } from '../types';

/**
 * POST /api/payment/create
 * Body: { provider: 'BAKONG' | 'ABA_PAYWAY', amount: number, orderId: string }
 */
const createPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, orderId, provider } = req.body;

    if (!amount || amount <= 0) {
      sendError(res, 'Invalid amount', 400);
      return;
    }
    if (!orderId) {
      sendError(res, 'Order ID is required', 400);
      return;
    }

    const paymentProvider = provider === 'ABA_PAYWAY' ? 'ABA_PAYWAY' as const : 'BAKONG' as const;

    // ─── Gate by admin settings ──────────────────────────────────
    try {
      const settings = await Settings.getSingleton();
      const p = settings.payment;
      if (paymentProvider === 'ABA_PAYWAY' && p?.abaEnabled === false) {
        sendError(res, 'ABA PayWay is currently disabled by the merchant.', 400);
        return;
      }
      if (paymentProvider === 'BAKONG' && p?.bakongEnabled === false) {
        sendError(res, 'Bakong KHQR is currently disabled by the merchant.', 400);
        return;
      }
    } catch {
      // If settings can't be read we don't hard-block — fall through.
    }

    if (paymentProvider === 'ABA_PAYWAY') {
      const result = await serviceCreatePayment('ABA_PAYWAY', amount, orderId);

      // Generate QR image from qr string for display
      let qrImage = '';
      try {
        qrImage = await QRCode.toDataURL(result.paymentResult.qrString, {
          width: 400,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        });
      } catch {}

      sendCreated(res, {
        provider: 'ABA_PAYWAY',
        qr: qrImage,
        qrString: result.paymentResult.qrString,
        tranId: result.paymentResult.tranId,
        expiresIn: result.paymentResult.expireInSec,
        transactionId: result.transaction._id,
      });
      return;
    }

    // Default: Bakong KHQR
    const khqrResult = await createKHQR(amount, orderId);

    const transaction = await Transaction.create({
      orderId,
      amount,
      provider: 'BAKONG',
      tran: khqrResult.tran,
      tranId: khqrResult.tran,
      md5: khqrResult.md5,
      qr: khqrResult.qr,
      status: 'PENDING',
      expireAt: new Date(Date.now() + 180 * 1000),
    });

    sendCreated(res, {
      provider: 'BAKONG',
      qr: transaction.qr,
      tran: transaction.tran,
      md5: transaction.md5,
      expiresIn: 180,
      transactionId: transaction._id,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * POST /api/payment/check  (body: { tranId, provider })
 * GET /api/payment/status/:md5  (backward-compatible, param: md5)
 */
const checkPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Support both POST body and GET params
    const md5 = req.params?.md5;
    const { tranId, provider } = req.body;
    const identifier = md5 || tranId;

    if (!identifier) {
      sendError(res, 'Transaction identifier (tranId or md5) is required', 400);
      return;
    }

    // Find transaction by tranId or md5
    let transaction: any = await Transaction.findOne({ tranId: identifier });
    if (!transaction) {
      transaction = await Transaction.findOne({ md5: identifier });
    }

    if (!transaction) {
      sendError(res, 'Transaction not found', 404);
      return;
    }

    const result = await checkPaymentByTransaction(transaction);

    if (result.success && result.status === 'PAID') {
      sendSuccess(res, {
        status: 'PAID',
        amount: transaction.amount,
        transactionId: transaction._id,
        paidTime: transaction.paidAt || transaction.updatedAt,
      });
      return;
    }

    if (result.status === 'EXPIRED') {
      sendSuccess(res, { status: 'EXPIRED' });
      return;
    }

    // For ABA, also return meta for status indicators
    if (transaction.provider === 'ABA_PAYWAY' && result.meta) {
      sendSuccess(res, {
        status: 'PENDING',
        meta: result.meta,
      });
      return;
    }

    sendSuccess(res, { status: 'PENDING' });
  } catch (error: any) {
    next(error);
  }
};

/**
 * POST /api/payment/save
 * Backward-compatible: saves a Bakong transaction created by frontend.
 */
const saveTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId, amount, md5, tran, qr } = req.body;
    if (!orderId || !amount || !md5 || !tran || !qr) {
      sendError(res, 'Missing required fields', 400);
      return;
    }
    await Transaction.updateMany({ orderId, status: 'PENDING' }, { status: 'EXPIRED' });
    const transaction = await Transaction.create({
      orderId, amount, provider: 'BAKONG',
      tran, tranId: tran, md5, qr,
      status: 'PENDING',
      expireAt: new Date(Date.now() + 180 * 1000),
    });
    sendCreated(res, {
      _id: transaction._id, orderId: transaction.orderId,
      amount: transaction.amount, md5: transaction.md5,
      tran: transaction.tran, qr: transaction.qr,
      status: transaction.status, createdAt: transaction.createdAt,
    });
  } catch (error: any) { next(error); }
};

/**
 * PUT /api/payment/status/:md5
 * Backward-compatible: updates transaction status from Bakong frontend polling.
 */
const updatePaymentStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { md5 } = req.params;
    const { status: newStatus } = req.body;
    if (!md5) { sendError(res, 'MD5 hash is required', 400); return; }
    if (!newStatus || !['PAID', 'EXPIRED'].includes(newStatus)) {
      sendError(res, 'Status must be PAID or EXPIRED', 400); return;
    }
    const transaction = await Transaction.findOne({ md5 });
    if (!transaction) { sendError(res, 'Transaction not found', 404); return; }
    if (transaction.status === 'PAID') { sendSuccess(res, { status: 'already_paid' }); return; }
    transaction.status = newStatus;
    await transaction.save();
    if (newStatus === 'PAID') {
      await confirmPayment(transaction);
    }
    sendSuccess(res, { status: newStatus, _id: transaction._id, orderId: transaction.orderId, updatedAt: transaction.updatedAt });
  } catch (error: any) { next(error); }
};

/**
 * POST /api/payment/webhook
 * Called by Bakong/third-party when payment is confirmed.
 */
const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { md5, status: webhookStatus, responseCode, tran } = req.body;

    let transaction = md5 ? await Transaction.findOne({ md5 }) : null;
    if (!transaction && tran) {
      transaction = await Transaction.findOne({ tran });
    }

    if (!transaction) {
      console.log(`[Webhook] Transaction not found (md5: ${md5}, tran: ${tran})`);
      res.json({ received: true });
      return;
    }

    if (transaction.status === 'PAID') {
      res.json({ received: true, status: 'already_paid' });
      return;
    }

    const isPaidByWebhook =
      webhookStatus === 'SUCCESS' ||
      webhookStatus === 'PAID' ||
      responseCode === 0;

    if (isPaidByWebhook) {
      await confirmPayment(transaction);
      console.log(`[Webhook] ✅ Payment confirmed via webhook: ${transaction._id}`);
    } else if (transaction.md5) {
      try {
        const checkResult = await checkTransactionStatus(transaction.md5);
        if (checkResult.responseCode === 0 || checkResult.status === 'SUCCESS') {
          await confirmPayment(transaction);
        }
      } catch {}
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Error:', error.message);
    res.json({ received: true, error: error.message });
  }
};

/**
 * GET /api/payment/subscribe/:tranId  (new)
 * GET /api/payment/subscribe/:md5     (backward-compatible)
 * Server-Sent Events endpoint for real-time payment notifications.
 */
const subscribePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const identifier = req.params.tranId || req.params.md5;

  if (!identifier) {
    sendError(res, 'Transaction ID is required', 400);
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(`data: ${JSON.stringify({ type: 'connected', identifier })}\n\n`);

  try {
    const transaction = await Transaction.findOne({ $or: [{ tranId: identifier }, { md5: identifier }] });
    if (transaction && transaction.status === 'PAID') {
      res.write(`data: ${JSON.stringify({
        type: 'payment',
        status: 'PAID',
        amount: transaction.amount,
        transactionId: transaction._id,
        paidTime: transaction.paidAt || transaction.updatedAt,
      })}\n\n`);
      res.end();
      return;
    }
    if (transaction && transaction.status === 'EXPIRED') {
      res.write(`data: ${JSON.stringify({ type: 'payment', status: 'EXPIRED' })}\n\n`);
      res.end();
      return;
    }
  } catch {}

  const eventHandler = (data: any) => {
    res.write(`data: ${JSON.stringify({ type: 'payment', ...data })}\n\n`);
    res.end();
  };

  const eventKey = `payment:${identifier}`;
  paymentEvents.on(eventKey, eventHandler);

  const heartbeat = setInterval(() => {
    res.write(`:heartbeat\n\n`);
  }, 15000);

  req.on('close', () => {
    paymentEvents.off(eventKey, eventHandler);
    clearInterval(heartbeat);
  });

  setTimeout(() => {
    paymentEvents.off(eventKey, eventHandler);
    clearInterval(heartbeat);
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'timeout' })}\n\n`);
      res.end();
    }
  }, 3 * 60 * 1000);
};

/**
 * Admin: Delete transaction
 */
const deleteTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      sendError(res, 'Transaction not found', 404);
      return;
    }
    await Transaction.findByIdAndDelete(req.params.id);
    sendDeleted(res);
  } catch (error: any) {
    next(error);
  }
};

/**
 * Admin: Get all transactions with filters
 */
const getAllTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const provider = req.query.provider as string;

    const filter: Record<string, any> = {};
    if (status && status !== 'all') filter.status = status.toUpperCase();
    if (provider && provider !== 'all') filter.provider = provider;
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { md5: { $regex: search, $options: 'i' } },
        { tran: { $regex: search, $options: 'i' } },
        { tranId: { $regex: search, $options: 'i' } },
      ];
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    sendSuccess(res, {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * GET /api/payment/stream
 * Global SSE stream for admin dashboard.
 */
const paymentStream = async (
  _req: Request,
  res: Response
): Promise<void> => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  const eventHandler = (data: any) => {
    res.write(`data: ${JSON.stringify({ type: 'payment', ...data })}\n\n`);
  };

  paymentEvents.on('payment:all', eventHandler);

  const heartbeat = setInterval(() => {
    res.write(`:heartbeat\n\n`);
  }, 15000);

  _req.on('close', () => {
    paymentEvents.off('payment:all', eventHandler);
    clearInterval(heartbeat);
  });
};

export {
  createPayment,
  checkPaymentStatus,
  saveTransaction,
  updatePaymentStatus,
  handleWebhook,
  subscribePayment,
  getAllTransactions,
  deleteTransaction,
  paymentStream,
};
