'use strict'

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createKhqr,
  checkPaymentStatus,
  updateTransactionStatus,
  PaymentStatus,
  POLL_INTERVAL_MS,
  QR_EXPIRY_SECONDS,
} from '@/services/bakong.service'

export interface PaymentSheetState {
  orderId: string
  amount: number
}

export const usePaymentStore = defineStore('payment', () => {
  // ─── Core State ─────────────────────────────────────────
  const status = ref<PaymentStatus>('IDLE')
  const error = ref<string | null>(null)

  const qrImage = ref<string>('')
  const md5 = ref<string>('')
  const tran = ref<string>('')

  const countdownSeconds = ref(QR_EXPIRY_SECONDS)
  const totalSeconds = ref(QR_EXPIRY_SECONDS)

  const paidTransactionId = ref<string | null>(null)
  const paidTime = ref<string | null>(null)

  const sheetOpen = ref(false)
  const paidAtTimestamp = ref<string | null>(null)

  // ─── Sheet Config ───────────────────────────────────────
  const orderId = ref<string>('')
  const amount = ref<number>(0)

  // ─── Internal ───────────────────────────────────────────
  let pollingTimer: ReturnType<typeof setInterval> | null = null
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  // ─── Computed ───────────────────────────────────────────
  const formattedTime = computed(() => {
    const min = Math.floor(countdownSeconds.value / 60)
    const sec = countdownSeconds.value % 60
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  })

  const countdownProgress = computed(() => {
    if (totalSeconds.value === 0) return 0
    return countdownSeconds.value / totalSeconds.value
  })

  const countdownColor = computed<'green' | 'orange' | 'red'>(() => {
    if (countdownSeconds.value <= 0) return 'red'
    if (countdownSeconds.value <= 30) return 'red'
    if (countdownSeconds.value <= 60) return 'orange'
    return 'green'
  })

  const isPaid = computed(() => status.value === 'PAID')
  const isExpired = computed(() => status.value === 'EXPIRED')
  const isLoading = computed(() => status.value === 'CREATING_QR')
  const isPending = computed(() => status.value === 'PENDING')

  // ─── Actions ────────────────────────────────────────────

  function openSheet(params: PaymentSheetState) {
    orderId.value = params.orderId
    amount.value = params.amount
    error.value = null
    sheetOpen.value = true
    startPayment()
  }

  function closeSheet() {
    sheetOpen.value = false
    cleanup()
  }

  async function startPayment() {
    cleanup()
    status.value = 'CREATING_QR'
    error.value = null
    countdownSeconds.value = QR_EXPIRY_SECONDS
    totalSeconds.value = QR_EXPIRY_SECONDS

    try {
      // Create KHQR via backend (local SDK) — backend auto-saves to DB
      const khqr = await createKhqr(amount.value, orderId.value)

      qrImage.value = khqr.qr
      md5.value = khqr.md5
      tran.value = khqr.tran

      // Start monitoring
      status.value = 'PENDING'
      startCountdown()
      startPolling()
    } catch (err: any) {
      status.value = 'ERROR'
      error.value = err.message || err.error || 'Failed to generate QR code'
    }
  }

  async function regenerateQR() {
    await startPayment()
  }

  function startPolling() {
    stopPolling()
    pollingTimer = setInterval(pollPaymentStatus, POLL_INTERVAL_MS)
  }

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  async function pollPaymentStatus() {
    if (!md5.value || status.value !== 'PENDING') return

    try {
      const res = await checkPaymentStatus(md5.value)

      const isSuccess = res.responseCode === 0 || res.status === 'PAID'

      if (isSuccess) {
        paidTransactionId.value = res.transactionId || null
        paidTime.value = formatPaidTime(res.paidTime)
        paidAtTimestamp.value = new Date().toISOString()
        status.value = 'PAID'
        stopPolling()
        stopCountdown()

        // Update backend
        await updateTransactionStatus(md5.value, 'PAID', {
          transactionId: res.transactionId,
          paidTime: res.paidTime,
        }).catch(() => {})
      }
    } catch {
      // Silently retry on next interval
    }
  }

  function startCountdown() {
    stopCountdown()
    countdownTimer = setInterval(() => {
      countdownSeconds.value--
      if (countdownSeconds.value <= 0) {
        status.value = 'EXPIRED'
        stopCountdown()
        stopPolling()

        // Notify backend
        updateTransactionStatus(md5.value, 'EXPIRED').catch(() => {})
      }
    }, 1000)
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }

  function cleanup() {
    stopPolling()
    stopCountdown()
    qrImage.value = ''
    md5.value = ''
    tran.value = ''
    paidTransactionId.value = null
    paidTime.value = null
    paidAtTimestamp.value = null
    error.value = null
  }

  function reset() {
    cleanup()
    status.value = 'IDLE'
    amount.value = 0
    orderId.value = ''
    countdownSeconds.value = QR_EXPIRY_SECONDS
    totalSeconds.value = QR_EXPIRY_SECONDS
  }

  function formatPaidTime(time?: string): string {
    if (!time) return ''
    const d = new Date(time)
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return {
    // State
    status,
    error,
    qrImage,
    md5,
    tran,
    countdownSeconds,
    totalSeconds,
    paidTransactionId,
    paidTime,
    paidAtTimestamp,
    sheetOpen,
    orderId,
    amount,
    // Computed
    formattedTime,
    countdownProgress,
    countdownColor,
    isPaid,
    isExpired,
    isLoading,
    isPending,
    // Actions
    openSheet,
    closeSheet,
    startPayment,
    regenerateQR,
    reset,
  }
})
