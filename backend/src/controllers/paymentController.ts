import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';
import Order from '../models/Order';
import { createKHQR, checkTransactionStatus } from '../services/bakong';
import { confirmPayment, paymentEvents } from '../services/paymentWatcher';
import { AuthRequest } from '../types';

/**
 * POST /api/payment/create
 * Body: { amount: number, orderId: string }
 * Backend calls: GET https://api.bakong-api.online/khqr/create?amount=X&bakongid=...&merchantname=...
 * Returns: { qr, tran, md5, expiresIn: 300 }
 */
const createPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid amount' });
      return;
    }
    if (!orderId) {
      res.status(400).json({ success: false, message: 'Order ID is required' });
      return;
    }

    // Expire any existing pending transactions for this order first
    await Transaction.updateMany(
      { orderId, status: 'PENDING' },
      { status: 'EXPIRED' }
    );

    // Create KHQR via local Bakong SDK
    const khqrResult = await createKHQR(amount, orderId);

    // Save transaction
    const transaction = await Transaction.create({
      orderId,
      amount,
      tran: khqrResult.tran,
      md5: khqrResult.md5,
      qr: khqrResult.qr,
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      qr: transaction.qr,
      tran: transaction.tran,
      md5: transaction.md5,
      expiresIn: 180,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * GET /api/payment/status/:md5
 * Backend calls: GET https://api.bakong-api.online/check_by_md5?md5=...&bakongid=...
 * If responseCode==0 OR status=="SUCCESS": update to PAID
 * Returns: { success, status, amount?, transactionId?, paidTime? }
 */
const checkPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { md5 } = req.params;

    if (!md5) {
      res.status(400).json({ success: false, message: 'MD5 hash is required' });
      return;
    }

    const transaction = await Transaction.findOne({ md5 });
    if (!transaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }

    // Already paid
    if (transaction.status === 'PAID') {
      res.json({
        success: true,
        status: 'PAID',
        amount: transaction.amount,
        transactionId: transaction._id,
        paidTime: transaction.updatedAt,
      });
      return;
    }

    // Already expired
    if (transaction.status === 'EXPIRED') {
      res.json({ success: false, status: 'EXPIRED' });
      return;
    }

    // Check expiry (3 minutes)
    const createdAt = new Date(transaction.createdAt).getTime();
    const now = Date.now();
    if (now - createdAt > 3 * 60 * 1000) {
      transaction.status = 'EXPIRED';
      await transaction.save();
      res.json({ success: false, status: 'EXPIRED' });
      return;
    }

    // Poll Bakong API
    try {
      const checkResult = await checkTransactionStatus(md5);

      const isPaid =
        checkResult.responseCode === 0 ||
        checkResult.status === 'SUCCESS';

      if (isPaid) {
        await confirmPayment(transaction);

        res.json({
          success: true,
          status: 'PAID',
          amount: transaction.amount,
          transactionId: transaction._id,
          paidTime: transaction.updatedAt,
        });
        return;
      }
    } catch (error: any) {
      console.error('Bakong check error:', error.message);
      // If Bakong API fails, return PENDING so frontend retries
    }

    res.json({ success: false, status: 'PENDING' });
  } catch (error: any) {
    next(error);
  }
};

/**
 * POST /api/payment/webhook
 * Called by Bakong/third-party when payment is confirmed.
 * Body: { md5: string, status?: string, responseCode?: number, tran?: string }
 * Responds with 200 always (to acknowledge receipt).
 */
const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { md5, status: webhookStatus, responseCode, tran } = req.body;

    // Try to find by md5 first, then by tran
    let transaction = md5 ? await Transaction.findOne({ md5 }) : null;
    if (!transaction && tran) {
      transaction = await Transaction.findOne({ tran });
    }

    if (!transaction) {
      // Transaction not found — still return 200 so Bakong doesn't retry
      console.log(`[Webhook] Transaction not found (md5: ${md5}, tran: ${tran})`);
      res.json({ received: true });
      return;
    }

    if (transaction.status === 'PAID') {
      res.json({ received: true, status: 'already_paid' });
      return;
    }

    // Check if webhook indicates success
    const isPaidByWebhook =
      webhookStatus === 'SUCCESS' ||
      webhookStatus === 'PAID' ||
      responseCode === 0;

    if (isPaidByWebhook) {
      await confirmPayment(transaction);
      console.log(`[Webhook] ✅ Payment confirmed via webhook: ${transaction._id}`);
    } else {
      // Also double-check with Bakong API to be sure
      if (transaction.md5) {
        try {
          const checkResult = await checkTransactionStatus(transaction.md5);
          if (
            checkResult.responseCode === 0 ||
            checkResult.status === 'SUCCESS'
          ) {
            await confirmPayment(transaction);
            console.log(`[Webhook] ✅ Payment confirmed via fallback check: ${transaction._id}`);
          }
        } catch {}
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Error:', error.message);
    // Always return 200 to prevent Bakong from retrying
    res.json({ received: true, error: error.message });
  }
};

/**
 * GET /api/payment/subscribe/:md5
 * Server-Sent Events endpoint for real-time payment notifications.
 * The client connects, and we push updates when payment is confirmed.
 */
const subscribePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { md5 } = req.params;

  if (!md5) {
    res.status(400).json({ success: false, message: 'MD5 hash is required' });
    return;
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ type: 'connected', md5 })}\n\n`);

  // Check current status immediately
  try {
    const transaction = await Transaction.findOne({ md5 });
    if (transaction && transaction.status === 'PAID') {
      res.write(`data: ${JSON.stringify({
        type: 'payment',
        status: 'PAID',
        amount: transaction.amount,
        transactionId: transaction._id,
        paidTime: transaction.updatedAt,
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

  // Subscribe to payment events for this md5
  const eventHandler = (data: any) => {
    res.write(`data: ${JSON.stringify({ type: 'payment', ...data })}\n\n`);
    res.end();
  };

  const eventKey = `payment:${md5}`;
  paymentEvents.on(eventKey, eventHandler);

  // Heartbeat to keep connection alive (every 15s)
  const heartbeat = setInterval(() => {
    res.write(`:heartbeat\n\n`);
  }, 15000);

  // Cleanup on disconnect
  req.on('close', () => {
    paymentEvents.off(eventKey, eventHandler);
    clearInterval(heartbeat);
  });

  // Timeout after 3 minutes (same as QR expiry)
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
 * GET /api/payment/transactions
 * Admin-only. Returns paginated transactions with optional search and status filter.
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

    const filter: Record<string, any> = {};
    if (status && status !== 'all') filter.status = status.toUpperCase();
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { md5: { $regex: search, $options: 'i' } },
        { tran: { $regex: search, $options: 'i' } },
      ];
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
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
 * Global SSE stream for admin dashboard. Pushes all payment events in real-time.
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

  // Forward all global payment events
  const eventHandler = (data: any) => {
    res.write(`data: ${JSON.stringify({ type: 'payment', ...data })}\n\n`);
  };

  paymentEvents.on('payment:all', eventHandler);

  // Heartbeat every 15s
  const heartbeat = setInterval(() => {
    res.write(`:heartbeat\n\n`);
  }, 15000);

  // Cleanup on disconnect
  _req.on('close', () => {
    paymentEvents.off('payment:all', eventHandler);
    clearInterval(heartbeat);
  });
};

export {
  createPayment,
  checkPaymentStatus,
  handleWebhook,
  subscribePayment,
  getAllTransactions,
  paymentStream,
};
