import { Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';
import Order from '../models/Order';
import { createKHQR, checkTransactionStatus } from '../services/bakong';
import { AuthRequest } from '../types';

const createPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.userId.toString() !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to pay this order',
      });
      return;
    }

    if (order.paymentMethod !== 'khqr') {
      res.status(400).json({
        success: false,
        message: 'This order does not use KHQR payment',
      });
      return;
    }

    const existingTransaction = await Transaction.findOne({
      orderId,
      status: 'pending',
    });
    if (existingTransaction) {
      res.json({ success: true, transaction: existingTransaction });
      return;
    }

    const khqrResponse = await createKHQR({
      amount: order.total,
      description: `Order #${order._id}`,
    });

    const transaction = await Transaction.create({
      orderId,
      tran: khqrResponse.tran,
      md5: khqrResponse.md5,
      amount: order.total,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      transaction,
      qr: khqrResponse.qr,
      md5: khqrResponse.md5,
    });
  } catch (error) {
    next(error);
  }
};

const checkPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }

    if (transaction.status !== 'pending') {
      res.json({ success: true, transaction });
      return;
    }

    // Check if expired (5 minutes)
    const createdAt = new Date(transaction.createdAt).getTime();
    const now = Date.now();
    const diffMs = now - createdAt;
    const expiryMs = 5 * 60 * 1000;

    if (diffMs > expiryMs) {
      transaction.status = 'expired';
      await transaction.save();

      const order = await Order.findById(transaction.orderId);
      if (order && order.status === 'pending') {
        order.status = 'cancelled';
        await order.save();
      }

      res.json({ success: true, transaction });
      return;
    }

    // Poll Bakong API
    if (transaction.md5) {
      try {
        const checkResult = await checkTransactionStatus(transaction.md5);

        if (
          checkResult.responseCode === 0 ||
          checkResult.status === 'SUCCESS'
        ) {
          transaction.status = 'PAID';
          await transaction.save();

          const order = await Order.findById(transaction.orderId);
          if (order) {
            order.status = 'confirmed';
            await order.save();
          }
        }
      } catch (error) {
        console.error('Bakong check error:', error);
      }
    }

    res.json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

const getTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      'orderId'
    );

    if (!transaction) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }

    res.json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(_req.query.page as string) || 1;
    const limit = parseInt(_req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find()
        .populate({
          path: 'orderId',
          populate: { path: 'userId', select: 'name email' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(),
    ]);

    res.json({
      success: true,
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export { createPayment, checkPayment, getTransaction, getAllTransactions };
