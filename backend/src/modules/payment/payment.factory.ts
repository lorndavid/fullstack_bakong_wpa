import Transaction, { ITransactionDocument, PaymentProvider } from '../../models/Transaction';
import Order from '../../models/Order';
import { abaProvider } from './providers/aba.provider';
import {
  createKHQR,
  checkTransactionStatus as bakongCheckStatus,
  QR_EXPIRY_SECONDS,
} from '../../services/bakong';

export type ProviderType = 'BAKONG' | 'ABA_PAYWAY';

export interface CreatePaymentResult {
  provider: ProviderType;
  qrString: string;
  qrImage?: string;
  tranId: string;
  md5?: string;
  expireInSec: number;
  clientId?: string;
}

export interface CheckPaymentResult {
  success: boolean;
  status?: string;
  meta?: Record<string, any>;
}

/**
 * Create a payment using the specified provider.
 */
export async function createPaymentByProvider(
  provider: ProviderType,
  amount: number,
  orderId: string
): Promise<CreatePaymentResult> {
  if (provider === 'ABA_PAYWAY') {
    const result = await abaProvider.createPayment(amount);

    return {
      provider: 'ABA_PAYWAY',
      qrString: result.qrString,
      tranId: result.tranId,
      expireInSec: result.expireInSec,
      clientId: result.clientId,
    };
  }

  // Default: Bakong KHQR
  const khqrResult = await createKHQR(amount, orderId);

  return {
    provider: 'BAKONG',
    qrString: khqrResult.qr,
    qrImage: khqrResult.qr,
    tranId: khqrResult.tran,
    md5: khqrResult.md5,
    expireInSec: QR_EXPIRY_SECONDS,
  };
}

/**
 * Check payment status by provider.
 */
export async function checkPaymentByProvider(
  provider: ProviderType,
  transaction: ITransactionDocument
): Promise<CheckPaymentResult> {
  if (provider === 'ABA_PAYWAY') {
    if (!transaction.tranId) {
      return { success: false, status: 'NO_TRAN_ID' };
    }

    const result = await abaProvider.verifyPayment(transaction.tranId, transaction.providerReference);

    if (result.success) {
      await abaProvider.confirmTransaction(transaction);
      return {
        success: true,
        status: 'PAID',
        meta: result.meta as Record<string, any>,
      };
    }

    return {
      success: false,
      status: 'PENDING',
      meta: result.meta as Record<string, any>,
    };
  }

  // Default: Bakong KHQR
  if (transaction.md5) {
    const bakongResult = await bakongCheckStatus(transaction.md5);
    const isPaid = bakongResult.responseCode === 0 || bakongResult.status === 'SUCCESS';

    if (isPaid) {
      transaction.status = 'PAID';
      transaction.paidAt = new Date();
      await transaction.save();
      const order = await Order.findById(transaction.orderId);
      if (order && order.status === 'pending') {
        order.status = 'confirmed';
        await order.save();
      }
      return { success: true, status: 'PAID' };
    }
  }

  return { success: false, status: 'PENDING' };
}

/**
 * Save a new transaction to the database.
 */
export async function saveTransaction(
  params: {
    orderId: string;
    amount: number;
    provider: ProviderType;
    tranId: string;
    md5?: string;
    qr?: string;
    expireInSec: number;
    providerReference?: string;
  }
): Promise<ITransactionDocument> {
  // Expire any existing pending transactions for this order
  await Transaction.updateMany(
    { orderId: params.orderId, status: 'PENDING' },
    { status: 'EXPIRED' }
  );

  const expireAt = new Date(Date.now() + params.expireInSec * 1000);

  const transaction = await Transaction.create({
    orderId: params.orderId,
    amount: params.amount,
    provider: params.provider,
    tranId: params.tranId,
    md5: params.md5,
    qr: params.qr,
    providerReference: params.providerReference,
    status: 'PENDING',
    expireAt,
  });

  return transaction;
}
