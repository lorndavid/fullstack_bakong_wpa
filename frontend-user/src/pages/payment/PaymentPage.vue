<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <!-- Payment Card -->
    <div class="w-full max-w-[380px] bg-white dark:bg-surface-800 rounded-3xl shadow-modal overflow-hidden animate-scale-in">
      <!-- Header -->
      <div class="bg-gradient-to-r from-primary-500 to-primary-600 p-5 text-white text-center">
        <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span class="text-white font-bold text-xl">M</span>
        </div>
        <p class="text-sm text-white/70 font-medium">Merchant</p>
        <h2 class="text-lg font-bold">MY SHOP</h2>
      </div>

      <!-- Body -->
      <div class="p-6">
        <!-- Pending State -->
        <div v-if="status === 'pending'" class="text-center space-y-5">
          <div>
            <p class="text-sm text-surface-500 dark:text-surface-400 mb-1">Amount</p>
            <p class="text-3xl font-bold text-surface-800 dark:text-white">${{ amount.toFixed(2) }}</p>
          </div>

          <!-- Countdown with Progress Ring -->
          <div class="relative w-20 h-20 mx-auto">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" stroke-width="6" class="dark:stroke-surface-600"/>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#0055A4" stroke-width="6"
                stroke-dasharray="282.7"
                :stroke-dashoffset="countdownOffset"
                class="transition-all duration-1000 ease-linear"
                stroke-linecap="round"/>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xl font-bold" :class="countdownSeconds <= 60 ? 'text-red-500' : 'text-primary-500'">{{ formattedTime }}</span>
            </div>
          </div>

          <!-- QR Code -->
          <div class="relative mx-auto w-48 h-48 bg-white dark:bg-surface-700 rounded-2xl p-3 shadow-card animate-pulse-soft">
            <div class="w-full h-full bg-surface-200 dark:bg-surface-600 rounded-lg flex items-center justify-center">
              <div class="grid grid-cols-10 gap-0.5 w-36 h-36">
                <div v-for="i in 100" :key="i" 
                  class="rounded-sm transition-colors"
                  :class="Math.random() > 0.5 ? 'bg-surface-800 dark:bg-white' : 'bg-transparent'"
                ></div>
              </div>
            </div>
          </div>

          <p class="text-xs text-surface-500 dark:text-surface-400 max-w-xs mx-auto">
            Please scan using any KHQR supported banking app
          </p>

          <!-- Supported Banks -->
          <div class="flex items-center justify-center gap-4 pt-2">
            <div v-for="bank in banks" :key="bank.name" class="flex flex-col items-center space-y-1">
              <div class="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-xl flex items-center justify-center text-[8px] font-bold text-surface-500">
                {{ bank.short }}
              </div>
              <span class="text-[10px] text-surface-400">{{ bank.name }}</span>
            </div>
          </div>
        </div>

        <!-- Success State -->
        <div v-if="status === 'success'" class="text-center space-y-4 animate-bounce-in">
          <div class="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-accent-500/30">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-surface-800 dark:text-white">Payment Successful</h2>
            <p class="text-2xl font-bold text-accent-500 mt-1">${{ amount.toFixed(2) }}</p>
          </div>
          <div class="bg-surface-50 dark:bg-surface-700 rounded-xl p-4 text-left space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-surface-500">Transaction ID</span>
              <span class="font-mono text-surface-800 dark:text-white">TXN{{ Date.now() }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-surface-500">Paid at</span>
              <span class="text-surface-800 dark:text-white">{{ new Date().toLocaleTimeString() }}</span>
            </div>
          </div>
          <router-link to="/" class="block w-full py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all">
            Continue Shopping
          </router-link>
        </div>

        <!-- Expired State -->
        <div v-if="status === 'expired'" class="text-center space-y-4 animate-scale-in">
          <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-surface-800 dark:text-white">Payment Expired</h2>
            <p class="text-sm text-surface-500 mt-1">The QR code has expired</p>
          </div>
          <button @click="regenerateQR" class="w-full py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all">
            Generate New QR
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const amount = ref(10.00)
const status = ref<'pending' | 'success' | 'expired'>('pending')
const countdownSeconds = ref(299) // 4:59
const totalSeconds = ref(299)

let pollingInterval: ReturnType<typeof setInterval> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null

const formattedTime = computed(() => {
  const min = Math.floor(countdownSeconds.value / 60)
  const sec = countdownSeconds.value % 60
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
})

const countdownOffset = computed(() => {
  const progress = (totalSeconds.value - countdownSeconds.value) / totalSeconds.value
  return 282.7 - (282.7 * progress)
})

const banks = [
  { name: 'ABA', short: 'ABA' },
  { name: 'ACLEDA', short: 'ACL' },
  { name: 'Wing', short: 'WNG' },
  { name: 'Sathapana', short: 'SAT' },
  { name: 'Bakong', short: 'BAK' },
]

onMounted(() => {
  startCountdown()
  startPolling()
})

onUnmounted(() => {
  stopPolling()
  stopCountdown()
})

function startCountdown() {
  countdownInterval = setInterval(() => {
    countdownSeconds.value--
    if (countdownSeconds.value <= 0) {
      status.value = 'expired'
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

function startPolling() {
  pollingInterval = setInterval(() => {
    checkPaymentStatus()
  }, 3000)
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

function checkPaymentStatus() {
  // Simulate payment check - in production, poll /api/payments/check/:transactionId
  const shouldSucceed = Math.random() > 0.98
  if (shouldSucceed) {
    status.value = 'success'
    stopPolling()
    stopCountdown()
    toast.success('Payment received!')
  }
}

function regenerateQR() {
  status.value = 'pending'
  countdownSeconds.value = 299
  startCountdown()
  startPolling()
  toast.info('New QR code generated')
}
</script>
