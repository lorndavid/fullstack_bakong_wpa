<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-surface-50 dark:bg-surface-900">
    <div class="text-center max-w-sm">
      <div class="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
        </svg>
      </div>
      <h2 class="text-lg font-bold text-surface-800 dark:text-white mb-2">KHQR Payment</h2>
      <p class="text-sm text-surface-500 mb-6">Proceeding to the new checkout sheet...</p>
      <button
        @click="openSheet"
        class="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all"
      >
        Open Payment Sheet
      </button>
    </div>

    <!-- KHQR Checkout Sheet -->
    <KhqrCheckoutSheet />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePaymentStore } from '@/stores/payment.store'
import KhqrCheckoutSheet from '@/components/khqr/KhqrCheckoutSheet.vue'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

function openSheet() {
  const orderId = (route.params.id as string) || ''
  const amount = parseFloat(route.query.amount as string) || 0

  if (!orderId && !amount) {
    router.push('/checkout')
    return
  }

  paymentStore.openSheet({ orderId, amount })
}

onMounted(() => {
  // Auto-open the sheet if we have payment data
  const orderId = (route.params.id as string) || ''
  const amount = parseFloat(route.query.amount as string) || 0

  if (orderId && amount > 0) {
    paymentStore.openSheet({ orderId, amount })
  } else if (!orderId && !amount) {
    router.push('/checkout')
  }
})
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
