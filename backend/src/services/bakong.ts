import axios from 'axios';
import { BakongCreateResponse, BakongCheckResponse } from '../types';

const BAKONG_API_URL = process.env.BAKONG_API_URL || 'https://api.bakong-api.online';
const MERCHANT_BAKONG_ID = process.env.MERCHANT_BAKONG_ID || '';
const MERCHANT_NAME = process.env.MERCHANT_NAME || 'MY SHOP';

const bakongApi = axios.create({
  baseURL: BAKONG_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface CreateQRParams {
  amount: number;
  description?: string;
}

const createKHQR = async (
  params: CreateQRParams
): Promise<BakongCreateResponse> => {
  try {
    const response = await bakongApi.post('/khqr/create', {
      amount: params.amount,
      merchantId: MERCHANT_BAKONG_ID,
      merchantName: MERCHANT_NAME,
      description: params.description || `Payment for order`,
      currency: 'KHR',
    });

    return {
      qr: response.data.qr,
      md5: response.data.md5,
      tran: response.data.tran,
    };
  } catch (error: any) {
    console.error('Bakong create QR error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to create KHQR payment'
    );
  }
};

const checkTransactionStatus = async (
  md5: string
): Promise<BakongCheckResponse> => {
  try {
    const response = await bakongApi.get('/check_by_md5', {
      params: { md5 },
    });

    return response.data;
  } catch (error: any) {
    console.error('Bakong check status error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to check transaction status'
    );
  }
};

export { createKHQR, checkTransactionStatus, bakongApi };
