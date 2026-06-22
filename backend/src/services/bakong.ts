import QRCode from 'qrcode';
import { BakongKHQR, IndividualInfo, khqrData } from 'bakong-khqr';

const MERCHANT_BAKONG_ID = process.env.MERCHANT_BAKONG_ID || '';
const MERCHANT_NAME = process.env.MERCHANT_NAME || 'MY SHOP';
const MERCHANT_CITY = process.env.MERCHANT_CITY || 'Phnom Penh';
const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY === 'USD' ? khqrData.currency.usd : khqrData.currency.khr;

// Official Bakong API configuration
const BAKONG_API_URL = process.env.BAKONG_API_URL || 'https://api-bakong.nbc.gov.kh';
const BAKONG_API_TOKEN = process.env.BAKONG_API_TOKEN || '';

// QR expiry in seconds (3 minutes)
const QR_EXPIRY_SECONDS = 180;

interface CreateQRResult {
  qr: string;
  md5: string;
  tran: string;
}

interface CheckStatusResult {
  responseCode: number;
  status: string;
  [key: string]: any;
}

/** Convert a KHQR string to a base64 PNG data URL */
async function qrToDataUrl(khqrString: string): Promise<string> {
  return QRCode.toDataURL(khqrString, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Create a real KHQR code using the official Bakong KHQR SDK.
 * Generates the QR string locally per EMVCo standard, then renders
 * it as a PNG image. No external API call needed for QR generation.
 */
const createKHQR = async (amount: number, orderId?: string): Promise<CreateQRResult> => {
  const info = new IndividualInfo(
    MERCHANT_BAKONG_ID,
    MERCHANT_NAME,
    MERCHANT_CITY,
    {
      amount,
      currency: DEFAULT_CURRENCY,
      billNumber: orderId?.slice(-25),
      storeLabel: MERCHANT_NAME,
      expirationTimestamp: Date.now() + QR_EXPIRY_SECONDS * 1000,
    }
  );

  const khqr = new BakongKHQR();
  const result = khqr.generateIndividual(info);

  // KHQRResponse always has status — check code 0 for success, data must exist
  if (!result || !result.data || result.status?.code !== 0) {
    const errMsg = result?.status?.message || 'KHQR SDK returned error';
    throw new Error(errMsg);
  }

  const khqrString = result.data.qr;
  const md5Hash = result.data.md5;

  if (!khqrString || !md5Hash) {
    throw new Error('KHQR generation returned empty result');
  }

  const qrImage = await qrToDataUrl(khqrString);

  console.log(`[Bakong] ✅ Real KHQR generated: md5=${md5Hash.slice(0, 12)}...`);

  return {
    qr: qrImage,
    md5: md5Hash,
    tran: `KHQR_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
  };
};

/**
 * Check transaction status via the official Bakong API.
 * 
 * 🔐 Authenticates with your Bakong developer JWT token.
 * 
 * POST {{BAKONG_API_URL}}/v1/check_transaction_by_md5
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * Body: { "md5": "..." }
 * 
 * Response:
 *   responseCode: 0  →  Payment confirmed! User has paid via their banking app.
 *   responseCode: 1  →  Not paid yet. Keep polling.
 * 
 * ⚠️ Note: The Bakong API enforces geographic restrictions.
 *    Requests from outside Cambodia may receive HTTP 403.
 *    For production, deploy your backend to a Cambodia-based server.
 */
const checkTransactionStatus = async (md5: string): Promise<CheckStatusResult> => {
  if (!BAKONG_API_TOKEN) {
    console.warn(`[Bakong] ⚠️ No BAKONG_API_TOKEN configured. Cannot verify payment.`);
    console.warn(`[Bakong] 💡 Add your Bakong developer token to .env: BAKONG_API_TOKEN=<jwt>`);
    return { responseCode: 1, status: 'PENDING' };
  }

  try {
    console.log(`[Bakong] 🔍 Checking payment status for md5=${md5.slice(0, 12)}...`);

    const response = await fetch(`${BAKONG_API_URL}/v1/check_transaction_by_md5`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BAKONG_API_TOKEN}`,
      },
      body: JSON.stringify({ md5 }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 403) {
        console.warn(`[Bakong] 🌏 Geo-blocked (HTTP 403). Your server is outside Cambodia.`);
        console.warn(`[Bakong] 💡 Deploy to a Cambodia-based server or use a VPN/proxy.`);
      } else {
        console.warn(`[Bakong] API error (${response.status}): ${errorText}`);
      }

      return { responseCode: 1, status: 'PENDING' };
    }

    const data = await response.json() as {
      responseCode?: number;
      status?: string;
      data?: Record<string, any>;
    };

    const responseCode = data.responseCode ?? -1;
    console.log(`[Bakong] 📡 API response: responseCode=${responseCode}`);

    if (responseCode === 0) {
      console.log(`[Bakong] ✅ Payment confirmed via Bakong API!`);
      return {
        responseCode: 0,
        status: 'SUCCESS',
        ...(data.data || {}),
      };
    }

    return { responseCode: 1, status: 'PENDING' };
  } catch (error: any) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      console.warn(`[Bakong] ⏱ API request timed out (15s).`);
    } else {
      console.warn(`[Bakong] ❌ API request failed: ${error.message}`);
    }
    return { responseCode: 1, status: 'PENDING' };
  }
};

export { createKHQR, checkTransactionStatus, QR_EXPIRY_SECONDS };
