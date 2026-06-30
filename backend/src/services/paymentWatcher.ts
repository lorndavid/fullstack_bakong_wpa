import { EventEmitter } from 'events';
import Transaction from '../models/Transaction';
import Order from '../models/Order';
import { checkTransactionStatus } from './bakong';
import { checkPaymentByProvider } from '../modules/payment/payment.factory';

// Event emitter for real-time payment notifications
export const paymentEvents = new EventEmitter();
paymentEvents.setMaxListeners(100);

const POLL_INTERVAL_MS = 5000; // Check every 5 seconds
const MAX_TRANSACTION_AGE_MS = 5 * 60 * 1000; // 5 minutes

let watcherInterval: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

/**
 * Mark a transaction as PAID and update the associated order.
 * Returns true if the transaction was successfully updated.
 */
export async function confirmPayment(transaction: any): Promise<boolean> {
  try {
    if (transaction.status === 'PAID') return true;

    transaction.status = 'PAID';
    transaction.paidAt = new Date();
    await transaction.save();

    // Update the associated order
    const order = await Order.findById(transaction.orderId);
    if (order && order.status === 'pending') {
      order.status = 'confirmed';
      await order.save();
    }

    const eventData = {
      status: 'PAID',
      amount: transaction.amount,
      transactionId: transaction._id,
      paidTime: transaction.paidAt || transaction.updatedAt,
      orderId: transaction.orderId,
      md5: transaction.md5,
      provider: transaction.provider,
    };

    // Emit event for specific tranId/md5 subscribers
    if (transaction.tranId) {
      paymentEvents.emit(`payment:${transaction.tranId}`, eventData);
    }
    if (transaction.md5) {
      paymentEvents.emit(`payment:${transaction.md5}`, eventData);
    }
    // Emit global event for admin dashboard
    paymentEvents.emit('payment:all', eventData);

    console.log(`[PaymentWatcher] ✅ Transaction ${transaction._id} confirmed (provider: ${transaction.provider})`);
    return true;
  } catch (error: any) {
    console.error(`[PaymentWatcher] Error confirming transaction ${transaction._id}:`, error.message);
    return false;
  }
}

/**
 * Check a single transaction's status against the appropriate API.
 */
async function checkTransaction(transaction: any): Promise<void> {
  try {
    // Skip if already paid or expired
    if (transaction.status === 'PAID' || transaction.status === 'EXPIRED' || transaction.status === 'FAILED') return;

    // Check if expired based on expireAt or max age
    if (transaction.expireAt) {
      if (new Date() > new Date(transaction.expireAt)) {
        transaction.status = 'EXPIRED';
        await transaction.save();
        const eventData = { status: 'EXPIRED', transactionId: transaction._id, orderId: transaction.orderId, provider: transaction.provider };
        if (transaction.tranId) paymentEvents.emit(`payment:${transaction.tranId}`, eventData);
        paymentEvents.emit('payment:all', eventData);
        return;
      }
    } else {
      const age = Date.now() - new Date(transaction.createdAt).getTime();
      if (age > MAX_TRANSACTION_AGE_MS) {
        transaction.status = 'EXPIRED';
        await transaction.save();
        const eventData = { status: 'EXPIRED', transactionId: transaction._id, orderId: transaction.orderId, provider: transaction.provider };
        if (transaction.md5) paymentEvents.emit(`payment:${transaction.md5}`, eventData);
        paymentEvents.emit('payment:all', eventData);
        return;
      }
    }

    // Route to the correct provider for status checking
    if (transaction.provider === 'ABA_PAYWAY') {
      if (!transaction.tranId) return;
      const result = await checkPaymentByProvider('ABA_PAYWAY', transaction);
      if (result.success) {
        await confirmPayment(transaction);
      }
    } else {
      // Bakong KHQR
      if (!transaction.md5) return;
      const checkResult = await checkTransactionStatus(transaction.md5);
      const isPaid = checkResult.responseCode === 0 || checkResult.status === 'SUCCESS';
      if (isPaid) {
        await confirmPayment(transaction);
      }
    }
  } catch (error: any) {
    // Silently fail - will retry on next poll
  }
}

/**
 * Poll all pending transactions and check their status.
 */
async function pollPendingTransactions(): Promise<void> {
  if (isRunning) return;
  isRunning = true;

  try {
    const pendingTransactions = await Transaction.find({ status: 'PENDING' });

    if (pendingTransactions.length === 0) {
      return;
    }

    // Check each transaction in parallel
    await Promise.allSettled(
      pendingTransactions.map((doc) => checkTransaction(doc))
    );
  } catch (error: any) {
    console.error('[PaymentWatcher] Poll error:', error.message);
  } finally {
    isRunning = false;
  }
}

/**
 * Start the background payment watcher.
 */
export function startPaymentWatcher(): void {
  if (watcherInterval) {
    console.log('[PaymentWatcher] Already running');
    return;
  }

  console.log(`[PaymentWatcher] Started (polling every ${POLL_INTERVAL_MS / 1000}s)`);

  // Run immediately then on interval
  pollPendingTransactions();
  watcherInterval = setInterval(pollPendingTransactions, POLL_INTERVAL_MS);
}

/**
 * Stop the background payment watcher.
 */
export function stopPaymentWatcher(): void {
  if (watcherInterval) {
    clearInterval(watcherInterval);
    watcherInterval = null;
    console.log('[PaymentWatcher] Stopped');
  }
}
