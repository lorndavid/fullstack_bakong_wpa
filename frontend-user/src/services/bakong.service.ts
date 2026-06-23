'use strict'

import api from './api'

// ─── Configuration ────────────────────────────────────────────
const POLL_INTERVAL_MS = 3000
const QR_EXPIRY_SECONDS = 180 // 3 minutes

// ─── Types ────────────────────────────────────────────────────
export interface KhqrCreateResponse {
  qr: string
  md5: string
  tran: string
  expiresIn: number
}

export interface KhqrStatusResponse {
  responseCode: number
  status: string
  amount?: number
  transactionId?: string
  paidTime?: string
  data?: Record<string, any>
}

export type PaymentStatus = 'IDLE' | 'CREATING_QR' | 'PENDING' | 'PAID' | 'EXPIRED' | 'ERROR'

// ─── QR Creation (local SDK via backend) ──────────────────────
/**
 * Creates a KHQR payment:
 * 1. Backend generates KHQR locally using bakong-khqr SDK (no external API call)
 * 2. Saves transaction to MongoDB with status PENDING
 * 3. Returns qr (base64 PNG data URL), md5, tran
 */
export async function createKhqr(amount: number, orderId: string): Promise<KhqrCreateResponse> {
  const res: any = await api.post('/payment/create', { amount, orderId })

  if (!res.qr || !res.md5 || !res.tran) {
    throw new Error(res.message || 'Failed to create KHQR payment')
  }

  return {
    qr: res.qr,
    md5: res.md5,
    tran: res.tran,
    expiresIn: res.expiresIn || QR_EXPIRY_SECONDS,
  }
}

// ─── Status Check (official Bakong API via backend) ───────────
/**
 * Checks payment status:
 * 1. Backend calls official Bakong API: POST /v1/check_transaction_by_md5
 * 2. Authenticated with your BAKONG_API_TOKEN JWT
 * 3. responseCode: 0 = paid, 1 = still pending
 */
export async function checkPaymentStatus(md5: string): Promise<KhqrStatusResponse> {
  const res: any = await api.get(`/payment/status/${md5}`)

  if (res.status === 'PAID') {
    return {
      responseCode: 0,
      status: 'PAID',
      amount: res.amount,
      transactionId: res.transactionId,
      paidTime: res.paidTime,
    }
  }

  if (res.status === 'EXPIRED') {
    return {
      responseCode: 1,
      status: 'EXPIRED',
    }
  }

  return {
    responseCode: 1,
    status: 'PENDING',
  }
}

// ─── Backend Persistence ──────────────────────────────────────
/**
 * Manually save a transaction (used when frontend creates QR directly).
 * Not needed when using createKhqr() since backend auto-saves.
 */
export async function saveTransaction(params: {
  orderId: string
  amount: number
  md5: string
  tran: string
  qr: string
}): Promise<void> {
  await api.post('/payment/save', params)
}

export async function updateTransactionStatus(
  md5: string,
  status: 'PAID' | 'EXPIRED',
  extra?: { transactionId?: string; paidTime?: string }
): Promise<void> {
  await api.put(`/payment/status/${md5}`, { status, ...extra })
}

// ─── Constants ────────────────────────────────────────────────
export {
  POLL_INTERVAL_MS,
  QR_EXPIRY_SECONDS,
}
