'use strict'

import api from './api'

// ─── Configuration ────────────────────────────────────────────
export const ABA_POLL_INTERVAL_MS = 3000
export const ABA_QR_EXPIRY_SECONDS = 180

// ─── Types ────────────────────────────────────────────────────
export interface AbaCreateResponse {
  success: boolean
  provider: 'ABA_PAYWAY'
  qr: string
  qrString: string
  tranId: string
  expiresIn: number
  transactionId: string
}

export interface AbaCheckResponse {
  success: boolean
  status: string
  amount?: number
  transactionId?: string
  paidTime?: string
  meta?: {
    qr_scanned: boolean
    payment_approved: boolean
    finished: boolean
  }
}

export type AbaPaymentStatus = 'IDLE' | 'CREATING_QR' | 'PENDING' | 'PAID' | 'EXPIRED' | 'ERROR'

// ─── Create ABA PayWay Payment ────────────────────────────────
export async function createAbaPayment(amount: number, orderId: string): Promise<AbaCreateResponse> {
  const res: any = await api.post('/payment/create', {
    provider: 'ABA_PAYWAY',
    amount,
    orderId,
  })

  if (!res.qr || !res.tranId) {
    throw new Error(res.message || 'Failed to create ABA PayWay payment')
  }

  return {
    success: true,
    provider: 'ABA_PAYWAY',
    qr: res.qr,
    qrString: res.qrString || '',
    tranId: res.tranId,
    expiresIn: res.expiresIn || ABA_QR_EXPIRY_SECONDS,
    transactionId: res.transactionId,
  }
}

// ─── Check ABA Payment Status ─────────────────────────────────
export async function checkAbaPaymentStatus(tranId: string): Promise<AbaCheckResponse> {
  const res: any = await api.post('/payment/check', {
    tranId,
    provider: 'ABA_PAYWAY',
  })

  if (res.status === 'PAID') {
    return {
      success: true,
      status: 'PAID',
      amount: res.amount,
      transactionId: res.transactionId,
      paidTime: res.paidTime,
    }
  }

  if (res.status === 'EXPIRED') {
    return {
      success: false,
      status: 'EXPIRED',
    }
  }

  return {
    success: false,
    status: 'PENDING',
    meta: res.meta,
  }
}
