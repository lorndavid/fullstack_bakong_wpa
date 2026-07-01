import axios from 'axios';
import Transaction, { ITransactionDocument } from '../../../models/Transaction';
import Order from '../../../models/Order';
import Settings from '../../../models/Settings';

const ABA_API_BASE = process.env.ABA_API_BASE || 'https://api.anajak.site';
const ENV_ABA_MERCHANT_LINK = process.env.ABA_MERCHANT_LINK || 'https://link.payway.com.kh/ABAPAY0j459666x';
const ABA_PROVIDER = 'ABA_PAYWAY';

/**
 * Read the ABA merchant link from the database (admin-configurable),
 * falling back to env defaults if the DB is unavailable.
 */
async function resolveAbaMerchantLink(): Promise<string> {
  try {
    const settings = await Settings.getSingleton();
    return settings.payment?.abaMerchantLink || ENV_ABA_MERCHANT_LINK;
  } catch {
    return ENV_ABA_MERCHANT_LINK;
  }
}

export interface AbaCreateQrResult {
  qr_string: string;
  expire_in_sec: number;
  status: {
    code: string;
    tran_id: string;
  };
  client_id?: string;
}

export interface AbaCheckStatusResult {
  meta: {
    qr_scanned: boolean;
    payment_approved: boolean;
    finished: boolean;
  };
}

export const ABA_QR_EXPIRY_SECONDS = 180;

/**
 * Create an ABA PayWay QR payment via the Anajak API.
 * POST /api/create-qr
 * Body: { url, amount }
 */
async function createPayment(amount: number): Promise<{
  qrString: string;
  tranId: string;
  expireInSec: number;
  clientId?: string;
}> {
  try {
    const merchantLink = await resolveAbaMerchantLink();

    if (!merchantLink) {
      throw new Error(
        'ABA merchant link is not configured. Set it in Admin → Payway Gateway.'
      );
    }

    const response = await axios.post<AbaCreateQrResult>(
      `${ABA_API_BASE}/api/create-qr`,
      {
        url: merchantLink,
        amount: Math.round(amount * 100) / 100, // ensure 2 decimal places
      },
      {
        timeout: 60000, // 60s timeout for Anajak API (server-side page navigation can be slow)
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = response.data;

    if (!data.qr_string || !data.status?.tran_id) {
      throw new Error('ABA API returned incomplete response');
    }

    console.log(`[ABAPayWay] ✅ QR created: tran_id=${data.status.tran_id}`);

    return {
      qrString: data.qr_string,
      tranId: data.status.tran_id,
      expireInSec: data.expire_in_sec || ABA_QR_EXPIRY_SECONDS,
      clientId: data.client_id,
    };
  } catch (error: any) {
    console.error(`[ABAPayWay] ❌ createPayment failed:`, error.message);
    throw new Error(error.response?.data?.message || error.message || 'ABA QR creation failed');
  }
}

/**
 * Check the status of an ABA transaction via the Anajak API.
 * POST /api/check-status
 * Body: { tran_id }
 */
async function checkStatus(tranId: string, clientId?: string): Promise<AbaCheckStatusResult> {
  try {
    const response = await axios.post<AbaCheckStatusResult>(
      `${ABA_API_BASE}/api/check-status`,
      { tran_id: tranId, ...(clientId ? { client_id: clientId } : {}) },
      {
        timeout: 60000, // 60s timeout for Anajak API (server-side page navigation can be slow)
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(`[ABAPayWay] ❌ checkStatus failed:`, error.message);
    throw new Error(error.response?.data?.message || error.message || 'ABA status check failed');
  }
}

/**
 * Verify payment by checking the transaction status against ABA rules.
 * Payment is successful when:
 *   meta.payment_approved === true
 *   AND meta.finished === true
 */
async function verifyPayment(tranId: string, clientId?: string): Promise<{
  success: boolean;
  meta?: AbaCheckStatusResult['meta'];
}> {
  try {
    const result = await checkStatus(tranId, clientId);
    const { meta } = result;

    const isApproved = meta?.payment_approved === true;
    const isFinished = meta?.finished === true;

    if (isApproved && isFinished) {
      console.log(`[ABAPayWay] ✅ Payment verified: tran_id=${tranId}`);
      return { success: true, meta };
    }

    return { success: false, meta };
  } catch (error: any) {
    console.error(`[ABAPayWay] ❌ verifyPayment failed:`, error.message);
    return { success: false };
  }
}

/**
 * Confirm an ABA transaction as PAID and update the associated order.
 */
async function confirmTransaction(transaction: ITransactionDocument): Promise<boolean> {
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

    console.log(`[ABAPayWay] ✅ Transaction ${transaction._id} confirmed (tranId: ${transaction.tranId})`);
    return true;
  } catch (error: any) {
    console.error(`[ABAPayWay] Error confirming transaction:`, error.message);
    return false;
  }
}

export const abaProvider = {
  createPayment,
  checkStatus,
  verifyPayment,
  confirmTransaction,
};
