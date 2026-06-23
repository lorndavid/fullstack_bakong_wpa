import { EventEmitter } from 'events';
import Transaction from '../models/Transaction';
import Order from '../models/Order';
import { checkTransactionStatus } from './bakong';

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
      paidTime: transaction.updatedAt,
      orderId: transaction.orderId,
      md5: transaction.md5,
    };

    // Emit event for specific md5 subscribers
    paymentEvents.emit(`payment:${transaction.md5}`, eventData);
    // Emit global event for admin dashboard
    paymentEvents.emit('payment:all', eventData);

    console.log(`[PaymentWatcher] ✅ Transaction ${transaction._id} confirmed (md5: ${transaction.md5})`);
    return true;
  } catch (error: any) {
    console.error(`[PaymentWatcher] Error confirming transaction ${transaction._id}:`, error.message);
    return false;
  }
}

/**
 * Check a single transaction's status against the Bakong API.
 */
async function checkTransaction(transaction: any): Promise<void> {
  try {
    // Skip if already paid, expired, or cancelled
    if (transaction.status === 'PAID' || transaction.status === 'EXPIRED' || transaction.status === 'CANCELLED') return;

    // Check if expired
    const age = Date.now() - new Date(transaction.createdAt).getTime();
    if (age > MAX_TRANSACTION_AGE_MS) {
      transaction.status = 'EXPIRED';
      await transaction.save();
      paymentEvents.emit(`payment:${transaction.md5}`, { status: 'EXPIRED' });
      paymentEvents.emit('payment:all', { status: 'EXPIRED', transactionId: transaction._id, orderId: transaction.orderId, md5: transaction.md5 });
      return;
    }

    // Check with Bakong API
    if (!transaction.md5) return;

    const checkResult = await checkTransactionStatus(transaction.md5);

    const isPaid =
      checkResult.responseCode === 0 ||
      checkResult.status === 'SUCCESS';

    if (isPaid) {
      await confirmPayment(transaction);
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
