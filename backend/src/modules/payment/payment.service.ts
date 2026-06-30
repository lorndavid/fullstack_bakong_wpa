import Transaction, { ITransactionDocument, PaymentProvider } from '../../models/Transaction';
import Order from '../../models/Order';
import {
  createPaymentByProvider,
  checkPaymentByProvider,
  saveTransaction,
  ProviderType,
} from './payment.factory';
import { EventEmitter } from 'events';

export const paymentEvents = new EventEmitter();
paymentEvents.setMaxListeners(100);

/**
 * Create a payment and save the transaction.
 */
export async function createPayment(
  provider: ProviderType,
  amount: number,
  orderId: string
) {
  const paymentResult = await createPaymentByProvider(provider, amount, orderId);

  const transaction = await saveTransaction({
    orderId,
    amount,
    provider,
    tranId: paymentResult.tranId,
    md5: paymentResult.md5,
    qr: paymentResult.qrImage || paymentResult.qrString,
    expireInSec: paymentResult.expireInSec,
    providerReference: paymentResult.clientId,
  });

  return {
    transaction,
    paymentResult,
  };
}

/**
 * Check and update payment status.
 */
export async function checkPaymentByTransaction(
  transaction: ITransactionDocument
) {
  if (transaction.status === 'PAID') {
    return { success: true, status: 'PAID' };
  }
  if (transaction.status === 'EXPIRED' || transaction.status === 'FAILED') {
    return { success: false, status: transaction.status };
  }

  // Check expiry
  if (transaction.expireAt && new Date() > transaction.expireAt) {
    transaction.status = 'EXPIRED';
    await transaction.save();
    paymentEvents.emit(`payment:${transaction.tranId}`, { status: 'EXPIRED' });
    paymentEvents.emit('payment:all', {
      status: 'EXPIRED',
      transactionId: transaction._id,
      orderId: transaction.orderId,
      provider: transaction.provider,
    });
    return { success: false, status: 'EXPIRED' };
  }

  const provider = transaction.provider as ProviderType;
  const result = await checkPaymentByProvider(provider, transaction);

  if (result.success) {
    paymentEvents.emit(`payment:${transaction.tranId}`, {
      status: 'PAID',
      amount: transaction.amount,
      transactionId: transaction._id,
      paidTime: transaction.paidAt,
      orderId: transaction.orderId,
    });
    paymentEvents.emit('payment:all', {
      status: 'PAID',
      amount: transaction.amount,
      transactionId: transaction._id,
      paidTime: transaction.paidAt,
      orderId: transaction.orderId,
      provider: transaction.provider,
    });
  }

  return result;
}

/**
 * Confirm a payment (mark as PAID, update order).
 */
export async function confirmPayment(
  transactionId: string,
  extra?: { paidAt?: string }
) {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) throw new Error('Transaction not found');

  if (transaction.status === 'PAID') return transaction;

  transaction.status = 'PAID';
  transaction.paidAt = extra?.paidAt ? new Date(extra.paidAt) : new Date();
  await transaction.save();

  const order = await Order.findById(transaction.orderId);
  if (order && order.status === 'pending') {
    order.status = 'confirmed';
    await order.save();
  }

  paymentEvents.emit(`payment:${transaction.tranId}`, {
    status: 'PAID',
    amount: transaction.amount,
    transactionId: transaction._id,
    paidTime: transaction.paidAt,
    orderId: transaction.orderId,
  });
  paymentEvents.emit('payment:all', {
    status: 'PAID',
    amount: transaction.amount,
    transactionId: transaction._id,
    paidTime: transaction.paidAt,
    orderId: transaction.orderId,
    provider: transaction.provider,
  });

  return transaction;
}
