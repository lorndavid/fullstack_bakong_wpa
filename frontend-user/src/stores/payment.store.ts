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
import {
  createAbaPayment,
  checkAbaPaymentStatus,
  AbaPaymentStatus,
  ABA_POLL_INTERVAL_MS,
  ABA_QR_EXPIRY_SECONDS,
} from '@/services/aba.service'

export interface PaymentSheetState {
  orderId: string
  amount: number
  provider?: 'BAKONG' | 'ABA_PAYWAY'
}

export const usePaymentStore = defineStore('payment', () => {
  // ─── Bakong Core State ──────────────────────────────────
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
  const orderId = ref<string>('')
  const amount = ref<number>(0)

  // ─── ABA PayWay State ───────────────────────────────────
  const abaStatus = ref<AbaPaymentStatus>('IDLE')
  const abaError = ref<string | null>(null)
  const abaQrImage = ref<string>('')
  const abaQrString = ref<string>('')
  const abaTranId = ref<string>('')
  const abaCountdownSeconds = ref(ABA_QR_EXPIRY_SECONDS)
  const abaTotalSeconds = ref(ABA_QR_EXPIRY_SECONDS)
  const abaPaidTransactionId = ref<string | null>(null)
  const abaPaidTime = ref<string | null>(null)
  const abaSheetOpen = ref(false)
  const abaOrderId = ref<string>('')
  const abaAmount = ref<number>(0)
  const abaQrScanned = ref(false)
  const abaPaymentApproved = ref(false)

  // ─── Internal ───────────────────────────────────────────
  let pollingTimer: ReturnType<typeof setInterval> | null = null
  let countdownTimer: ReturnType<typeof setInterval> | null = null
  let abaPollingTimer: ReturnType<typeof setInterval> | null = null
  let abaCountdownTimer: ReturnType<typeof setInterval> | null = null

  // ─── Bakong Computed ────────────────────────────────────
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

  // ─── ABA Computed ───────────────────────────────────────
  const abaFormattedTime = computed(() => {
    const min = Math.floor(abaCountdownSeconds.value / 60)
    const sec = abaCountdownSeconds.value % 60
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  })

  const abaCountdownProgress = computed(() => {
    if (abaTotalSeconds.value === 0) return 0
    return abaCountdownSeconds.value / abaTotalSeconds.value
  })

  const abaIsPaid = computed(() => abaStatus.value === 'PAID')
  const abaIsExpired = computed(() => abaStatus.value === 'EXPIRED')
  const abaIsLoading = computed(() => abaStatus.value === 'CREATING_QR')
  const abaIsPending = computed(() => abaStatus.value === 'PENDING')

  // ─── Bakong Actions ─────────────────────────────────────

  function openSheet(params: PaymentSheetState) {
    orderId.value = params.orderId
    amount.value = params.amount
    error.value = null
    sheetOpen.value = true
    startPayment()
  }

  function closeSheet() {
    if (status.value === 'PENDING' && md5.value) {
      updateTransactionStatus(md5.value, 'EXPIRED').catch(() => {})
    }
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
      const khqr = await createKhqr(amount.value, orderId.value)

      qrImage.value = khqr.qr
      md5.value = khqr.md5
      tran.value = khqr.tran

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
    if (pollingTimer) { clearInterval(pollingTimer); pollingTimer = null }
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
        await updateTransactionStatus(md5.value, 'PAID', {
          transactionId: res.transactionId,
          paidTime: res.paidTime,
        }).catch(() => {})
      }
    } catch { }
  }

  function startCountdown() {
    stopCountdown()
    countdownTimer = setInterval(() => {
      countdownSeconds.value--
      if (countdownSeconds.value <= 0) {
        status.value = 'EXPIRED'
        stopCountdown()
        stopPolling()
        updateTransactionStatus(md5.value, 'EXPIRED').catch(() => {})
      }
    }, 1000)
  }

  function stopCountdown() {
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
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

  // ─── ABA Actions ────────────────────────────────────────

  function abaOpenSheet(params: { orderId: string; amount: number }) {
    abaOrderId.value = params.orderId
    abaAmount.value = params.amount
    abaError.value = null
    abaSheetOpen.value = true
    abaQrScanned.value = false
    abaPaymentApproved.value = false
    abaStartPayment()
  }

  function abaCloseSheet() {
    abaSheetOpen.value = false
    abaCleanup()
  }

  async function abaStartPayment() {
    abaCleanup()
    abaStatus.value = 'CREATING_QR'
    abaError.value = null
    abaCountdownSeconds.value = ABA_QR_EXPIRY_SECONDS
    abaTotalSeconds.value = ABA_QR_EXPIRY_SECONDS

    try {
      const result = await createAbaPayment(abaAmount.value, abaOrderId.value)

      abaQrImage.value = result.qr
      abaQrString.value = result.qrString
      abaTranId.value = result.tranId

      abaStatus.value = 'PENDING'
      abaStartCountdown()
      abaStartPolling()
    } catch (err: any) {
      abaStatus.value = 'ERROR'
      abaError.value = err.message || err.error || 'Failed to generate ABA PayWay QR'
    }
  }

  async function abaGenerateNewQr() {
    await abaStartPayment()
  }

  function abaStartPolling() {
    abaStopPolling()
    abaPollingTimer = setInterval(abaPollPaymentStatus, ABA_POLL_INTERVAL_MS)
  }

  function abaStopPolling() {
    if (abaPollingTimer) { clearInterval(abaPollingTimer); abaPollingTimer = null }
  }

  async function abaPollPaymentStatus() {
    if (!abaTranId.value || abaStatus.value !== 'PENDING') return

    try {
      const res = await checkAbaPaymentStatus(abaTranId.value)

      // Check for intermediate status indicators from ABA meta
      if (res.meta) {
        if (res.meta.qr_scanned) {
          abaQrScanned.value = true
        }
        if (res.meta.payment_approved) {
          abaPaymentApproved.value = true
        }
        if (res.meta.qr_scanned && !res.meta.payment_approved && !res.meta.finished) {
          // QR scanned but not yet approved
        }
      }

      if (res.status === 'PAID') {
        abaPaidTransactionId.value = res.transactionId || abaTranId.value
        abaPaidTime.value = formatPaidTime(res.paidTime)
        abaStatus.value = 'PAID'
        abaStopPolling()
        abaStopCountdown()
      }
    } catch { }
  }

  function abaStartCountdown() {
    abaStopCountdown()
    abaCountdownTimer = setInterval(() => {
      abaCountdownSeconds.value--
      if (abaCountdownSeconds.value <= 0) {
        abaStatus.value = 'EXPIRED'
        abaStopCountdown()
        abaStopPolling()
      }
    }, 1000)
  }

  function abaStopCountdown() {
    if (abaCountdownTimer) { clearInterval(abaCountdownTimer); abaCountdownTimer = null }
  }

  function abaCleanup() {
    abaStopPolling()
    abaStopCountdown()
    abaQrImage.value = ''
    abaQrString.value = ''
    abaTranId.value = ''
    abaPaidTransactionId.value = null
    abaPaidTime.value = null
    abaError.value = null
    abaQrScanned.value = false
    abaPaymentApproved.value = false
  }

  function abaReset() {
    abaCleanup()
    abaStatus.value = 'IDLE'
    abaAmount.value = 0
    abaOrderId.value = ''
    abaCountdownSeconds.value = ABA_QR_EXPIRY_SECONDS
    abaTotalSeconds.value = ABA_QR_EXPIRY_SECONDS
  }

  function formatPaidTime(time?: string): string {
    if (!time) return ''
    const d = new Date(time)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return {
    // Bakong State
    status, error, qrImage, md5, tran,
    countdownSeconds, totalSeconds,
    paidTransactionId, paidTime, paidAtTimestamp,
    sheetOpen, orderId, amount,
    // Bakong Computed
    formattedTime, countdownProgress, countdownColor,
    isPaid, isExpired, isLoading, isPending,
    // Bakong Actions
    openSheet, closeSheet, startPayment, regenerateQR, reset,

    // ABA State
    abaStatus, abaError, abaQrImage, abaQrString, abaTranId,
    abaCountdownSeconds, abaTotalSeconds,
    abaPaidTransactionId, abaPaidTime,
    abaSheetOpen, abaOrderId, abaAmount,
    abaQrScanned, abaPaymentApproved,
    // ABA Computed
    abaFormattedTime, abaCountdownProgress,
    abaIsPaid, abaIsExpired, abaIsLoading, abaIsPending,
    // ABA Actions
    abaOpenSheet, abaCloseSheet, abaStartPayment, abaGenerateNewQr, abaReset,
  }
})
