<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-surface-50 dark:bg-surface-900">
    <!-- Loading State -->
    <div v-if="creatingQR" class="text-center animate-scale-in">
      <div class="w-20 h-20 mx-auto mb-4 relative">
        <div class="absolute inset-0 border-4 border-primary-200 dark:border-primary-800 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
      </div>
      <p class="text-surface-500 dark:text-surface-400 font-medium">Generating QR Code...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center animate-scale-in max-w-sm">
      <div class="w-20 h-20 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
        <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
      </div>
      <h2 class="text-lg font-bold text-surface-800 dark:text-white mb-2">Failed to Generate QR</h2>
      <p class="text-sm text-surface-500 mb-6">{{ error }}</p>
      <div class="flex gap-3 justify-center">
        <button @click="initPayment" class="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all focus:ring-4 focus:ring-primary-500/30">
          Try Again
        </button>
        <router-link to="/checkout" class="px-6 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 font-semibold rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-all">
          Back to Checkout
        </router-link>
      </div>
    </div>

    <!-- SUCCESS Full Screen -->
    <div v-else-if="status === 'PAID'" class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-accent-50 via-white to-accent-100 dark:from-accent-900/30 dark:via-surface-900 dark:to-accent-900/20 animate-scale-in">
      <div class="text-center px-6 max-w-sm">
        <!-- Animated Checkmark -->
        <div class="relative mx-auto mb-6 w-28 h-28">
          <div class="absolute inset-0 bg-accent-500/20 rounded-full animate-ping-slow"></div>
          <div class="absolute inset-0 bg-accent-500 rounded-full flex items-center justify-center shadow-2xl shadow-accent-500/40 animate-bounce-in">
            <svg class="w-14 h-14 text-white animate-draw-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" class="animate-draw-check-path"/>
            </svg>
          </div>
        </div>

        <h1 class="text-2xl font-bold text-surface-800 dark:text-white mb-2 animate-slide-up">Payment Successful</h1>
        <p class="text-4xl font-bold text-accent-500 mb-8 animate-slide-up" style="animation-delay: 0.1s">
          ${{ amount.toFixed(2) }}
        </p>

        <!-- Details Card -->
        <div class="bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg mb-8 text-left space-y-3 animate-slide-up" style="animation-delay: 0.2s">
          <div class="flex justify-between text-sm">
            <span class="text-surface-500">Transaction ID</span>
            <span class="font-mono text-xs text-surface-800 dark:text-white font-medium">{{ paidTransactionId?.slice(-12) || 'N/A' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-surface-500">Merchant</span>
            <span class="text-surface-800 dark:text-white font-medium">MY SHOP</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-surface-500">Paid at</span>
            <span class="text-surface-800 dark:text-white font-medium">{{ paidTime || new Date().toLocaleTimeString() }}</span>
          </div>
        </div>

        <!-- Buttons -->
        <div class="space-y-3 animate-slide-up" style="animation-delay: 0.3s">
          <router-link to="/orders"
            class="block w-full py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all focus:ring-4 focus:ring-primary-500/30 shadow-lg shadow-primary-500/25">
            View Order
          </router-link>
          <router-link to="/"
            class="block w-full py-3.5 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 font-semibold rounded-xl border border-surface-200 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-700 transition-all">
            Continue Shopping
          </router-link>
        </div>
      </div>
    </div>

    <!-- EXPIRED Screen -->
    <div v-else-if="status === 'EXPIRED'" class="text-center animate-scale-in max-w-sm">
      <div class="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-bounce-in">
        <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h2 class="text-xl font-bold text-surface-800 dark:text-white mb-2">Payment Expired</h2>
      <p class="text-sm text-surface-500 mb-8">The QR code has expired. Please generate a new one.</p>
      <div class="space-y-3">
        <button @click="regenerateQR"
          class="w-full py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all focus:ring-4 focus:ring-primary-500/30 shadow-lg shadow-primary-500/25">
          Generate New QR
        </button>
        <router-link to="/checkout"
          class="block w-full py-3.5 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 font-semibold rounded-xl border border-surface-200 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-700 transition-all">
          Back to Cart
        </router-link>
      </div>
    </div>

    <!-- QR Payment Card -->
    <div v-else class="w-full max-w-[380px] animate-scale-in">
      <div class="bg-white dark:bg-surface-800 rounded-3xl shadow-2xl overflow-hidden">
        <!-- Top Section -->
        <div class="bg-gradient-to-b from-primary-500 to-primary-600 p-6 text-center relative">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <!-- Merchant Logo -->
          <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-lg">
            <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <p class="text-xs text-white/70 font-medium uppercase tracking-wider mb-0.5">Merchant</p>
          <h2 class="text-lg font-bold text-white">MY SHOP</h2>
          <p class="text-xs text-white/60 mt-1">Secure KHQR Payment</p>

          <!-- Amount + Countdown Row -->
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <div class="text-left">
              <p class="text-[10px] text-white/60 uppercase tracking-wider">Amount</p>
              <p class="text-2xl font-bold text-white">${{ amount.toFixed(2) }}</p>
            </div>

            <!-- Countdown Ring -->
            <div class="relative w-[60px] h-[60px] flex-shrink-0">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="25" fill="none" stroke="white" stroke-opacity="0.15" stroke-width="4"/>
                <circle cx="30" cy="30" r="25" fill="none" stroke="white" stroke-width="4"
                  stroke-dasharray="157.08"
                  :stroke-dashoffset="countdownOffset"
                  class="transition-all duration-1000 ease-linear"
                  stroke-linecap="round"/>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center flex-col">
                <span class="text-[10px] text-white/60 font-medium">Time</span>
                <span class="text-sm font-bold text-white leading-tight"
                  :class="countdownSeconds <= 30 ? 'animate-pulse text-red-300' : ''">{{ formattedTime }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- QR Section -->
        <div class="p-6 pb-5">
          <div class="relative mx-auto w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] bg-surface-50 dark:bg-surface-700/50 rounded-[20px] p-3 shadow-inner">
            <!-- Pulse border -->
            <div class="absolute inset-0 rounded-[20px] border-2 border-primary-500/20 animate-pulse-soft pointer-events-none"></div>
            <!-- QR Image -->
            <img
              v-if="qrImage"
              :src="qrImage"
              alt="KHQR Code"
              class="w-full h-full object-contain rounded-[14px]"
            />
            <div v-else class="w-full h-full bg-surface-100 dark:bg-surface-600 rounded-[14px] flex items-center justify-center">
              <svg class="w-12 h-12 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
              </svg>
            </div>
          </div>

          <!-- Guideline Card -->
          <div class="mb-4 bg-gradient-to-r from-primary-50/80 to-accent-50/80 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-4 border border-primary-100 dark:border-primary-800/30">
            <div class="flex items-center gap-2 mb-3">
              <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">How to Pay</span>
            </div>
            <div class="space-y-2.5">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-[11px] font-bold mt-0.5">1</div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-surface-800 dark:text-white">Scan the QR code</p>
                  <p class="text-[11px] text-surface-500 dark:text-surface-400">Open your banking app and scan the QR code above</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-[11px] font-bold mt-0.5">2</div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-surface-800 dark:text-white">Review payment details</p>
                  <p class="text-[11px] text-surface-500 dark:text-surface-400">Check the amount <strong class="text-surface-700 dark:text-surface-200">${{ amount.toFixed(2) }}</strong> and merchant <strong class="text-surface-700 dark:text-surface-200">MY SHOP</strong></p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-[11px] font-bold mt-0.5">3</div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-surface-800 dark:text-white">Confirm payment</p>
                  <p class="text-[11px] text-surface-500 dark:text-surface-400">Enter your PIN or fingerprint to authorize the payment</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center text-[11px] font-bold mt-0.5">4</div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-surface-800 dark:text-white">Wait for confirmation</p>
                  <p class="text-[11px] text-surface-500 dark:text-surface-400">The page will update automatically once your payment is confirmed</p>
                </div>
              </div>
            </div>
            <div class="mt-2.5 pt-2.5 border-t border-primary-100 dark:border-primary-800/30">
              <p class="text-[10px] text-primary-400 dark:text-primary-500 font-medium flex items-center gap-1.5">
                <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Secure payment via Bakong KHQR
              </p>
            </div>
          </div>

          <!-- Bank Icons Row -->
          <div class="flex items-center justify-center gap-3 mb-5">
            <div v-for="bank in banks" :key="bank.name"
              class="flex flex-col items-center gap-1 group">
              <div class="w-10 h-10 bg-surface-100 dark:bg-surface-700/50 rounded-xl flex items-center justify-center text-[9px] font-extrabold tracking-tight text-surface-400 dark:text-surface-500 transition-all duration-200 group-hover:scale-110 group-hover:shadow-md">
                {{ bank.short }}
              </div>
              <span class="text-[9px] text-surface-400 dark:text-surface-500 font-medium">{{ bank.name }}</span>
            </div>
          </div>

          <!-- Status Bar -->
          <div class="bg-surface-50 dark:bg-surface-700/30 rounded-2xl p-4 text-center">
            <p class="text-sm font-medium text-surface-600 dark:text-surface-300 flex items-center justify-center gap-1.5">
              <span class="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></span>
              Waiting for payment
              <span class="inline-flex">
                <span class="animate-bounce-dot" style="animation-delay: 0s">.</span>
                <span class="animate-bounce-dot" style="animation-delay: 0.15s">.</span>
                <span class="animate-bounce-dot" style="animation-delay: 0.3s">.</span>
              </span>
            </p>
            <p class="text-[10px] text-surface-400 dark:text-surface-500 mt-1.5">Payment will be confirmed automatically</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import api from '@/services/api'

// SSE reconnection and polling config
const SSE_RECONNECT_DELAY = 3000
const POLLING_FALLBACK_INTERVAL = 5000

const route = useRoute()
const router = useRouter()

// State
const amount = ref(0)
const orderId = ref('')
const qrImage = ref('')
const md5 = ref('')
const tran = ref('')
const creatingQR = ref(true)
const error = ref<string | null>(null)
const status = ref<'PENDING' | 'PAID' | 'EXPIRED'>('PENDING')
const paidTransactionId = ref<string | null>(null)
const paidTime = ref<string | null>(null)

// Countdown
const countdownSeconds = ref(180) // 3 minutes
const totalSeconds = ref(180)

let eventSource: EventSource | null = null
let pollingInterval: ReturnType<typeof setInterval> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null

const formattedTime = computed(() => {
  const min = Math.floor(countdownSeconds.value / 60)
  const sec = countdownSeconds.value % 60
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
})

const countdownOffset = computed(() => {
  const progress = countdownSeconds.value / totalSeconds.value
  return 157.08 * (1 - progress)
})

const banks = [
  { name: 'ABA', short: 'ABA' },
  { name: 'ACLEDA', short: 'ACL' },
  { name: 'WING', short: 'WNG' },
  { name: 'Bakong', short: 'BAK' },
  { name: 'SATHAPANA', short: 'SAT' },
]

onMounted(() => {
  orderId.value = route.params.id as string || route.query.orderId as string || ''
  amount.value = parseFloat(route.query.amount as string) || 0

  if (!orderId.value && !amount.value) {
    error.value = 'No payment information provided'
    creatingQR.value = false
    return
  }

  initPayment()
})

onUnmounted(() => {
  stopSSE()
  stopPolling()
  stopCountdown()
})

async function initPayment() {
  creatingQR.value = true
  error.value = null
  status.value = 'PENDING'
  countdownSeconds.value = 180
  totalSeconds.value = 180

  try {
    const res: any = await api.post('/payment/create', {
      orderId: orderId.value,
      amount: amount.value,
    })

    qrImage.value = res.qr
    md5.value = res.md5
    tran.value = res.tran

    creatingQR.value = false
    startCountdown()
    // Try SSE first, fall back to polling
    startSSE()
  } catch (err: any) {
    creatingQR.value = false
    error.value = err.message || err.error || 'Failed to create payment'
  }
}

/**
 * Start Server-Sent Events connection for real-time payment updates.
 * Falls back to polling if SSE is unavailable or fails.
 */
function startSSE() {
  stopSSE()
  stopPolling()

  if (!md5.value) return

  const sseUrl = `/api/payment/subscribe/${md5.value}`

  try {
    eventSource = new EventSource(sseUrl)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'payment') {
          if (data.status === 'PAID') {
            handlePaymentSuccess(data)
          } else if (data.status === 'EXPIRED') {
            handlePaymentExpired()
          }
        }
      } catch {}
    }

    eventSource.onerror = () => {
      // SSE connection failed or dropped — fall back to polling
      stopSSE()
      console.log('[Payment] SSE failed, falling back to polling')
      startPolling()
    }

    // Timeout: if SSE doesn't get a payment event within 10s, start polling as backup too
    setTimeout(() => {
      if (eventSource && status.value === 'PENDING') {
        // Keep SSE but also start polling as a backup
        startPolling()
      }
    }, 10000)
  } catch {
    // EventSource not supported, fall back to polling
    startPolling()
  }
}

function stopSSE() {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

function startPolling() {
  if (pollingInterval) return // Already polling
  pollingInterval = setInterval(checkPaymentStatus, POLLING_FALLBACK_INTERVAL)
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

function startCountdown() {
  stopCountdown()
  countdownInterval = setInterval(() => {
    countdownSeconds.value--
    if (countdownSeconds.value <= 0) {
      status.value = 'EXPIRED'
      stopCountdown()
      stopPolling()
    }
  }, 1000)
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
}

async function checkPaymentStatus() {
  if (!md5.value) return

  try {
    const res: any = await api.get(`/payment/status/${md5.value}`)

    if (res.status === 'PAID') {
      handlePaymentSuccess(res)
    } else if (res.status === 'EXPIRED') {
      handlePaymentExpired()
    }
    // PENDING = keep polling
  } catch {
    // Silently retry on next interval
  }
}

function handlePaymentSuccess(res: any) {
  status.value = 'PAID'
  paidTransactionId.value = res.transactionId || null
  paidTime.value = formatPaidTime(res.paidTime)
  stopSSE()
  stopPolling()
  stopCountdown()
  useCartStore().clearCart()
}

function handlePaymentExpired() {
  status.value = 'EXPIRED'
  stopSSE()
  stopPolling()
  stopCountdown()
}

async function regenerateQR() {
  countdownSeconds.value = 180
  totalSeconds.value = 180
  status.value = 'PENDING'
  await initPayment()
}

function formatPaidTime(time: string): string {
  if (!time) return ''
  const d = new Date(time)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<style scoped>
@keyframes ping-slow {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.5); opacity: 0; }
}

@keyframes bounce-dot {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
  40% { transform: translateY(-4px); opacity: 1; }
}

@keyframes draw-check-path {
  from { stroke-dashoffset: 30; }
  to { stroke-dashoffset: 0; }
}

@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.5; }
}

.animate-ping-slow {
  animation: ping-slow 2s ease-out infinite;
}

.animate-bounce-dot {
  display: inline-block;
  animation: bounce-dot 1.4s ease-in-out infinite;
}

.animate-draw-check-path {
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: draw-check-path 0.5s ease-out 0.3s forwards;
}

.animate-bounce-in {
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out forwards;
  opacity: 0;
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out forwards;
}

.animate-pulse-soft {
  animation: pulse-soft 2s ease-in-out infinite;
}
</style>
