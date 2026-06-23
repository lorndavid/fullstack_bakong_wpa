<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="store.sheetOpen"
        class="fixed inset-0 z-[999] bg-black/55 backdrop-blur-[10px]"
        @click.self="handleBackdropClick"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="sheet">
      <div
        v-if="store.sheetOpen"
        class="fixed inset-x-0 bottom-0 z-[1000] flex items-end justify-center"
      >
        <div
          class="relative w-full bg-white dark:bg-surface-800 rounded-[28px] shadow-[0_30px_100px_rgba(0,0,0,0.25)] overflow-hidden"
          :class="sheetClasses"
        >
          <!-- Scrollable Content -->
          <div class="overflow-y-auto h-full" :class="scrollClasses">
            <div class="px-5 pb-8 pt-4">
              <!-- ⏳ Loading State -->
              <template v-if="store.isLoading">
                <KhqrHeader merchant-name="MY STORE" subtitle="Secure KHQR Payment" />
                <div class="flex flex-col items-center justify-center py-16 gap-4">
                  <div class="relative w-16 h-16">
                    <div class="absolute inset-0 border-4 border-primary-200 dark:border-primary-800 rounded-full" />
                    <div class="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
                  </div>
                  <p class="text-sm font-medium text-surface-400">Generating QR Code...</p>
                </div>
              </template>

              <!-- ❌ Error State -->
              <template v-else-if="store.status === 'ERROR'">
                <KhqrHeader merchant-name="MY STORE" subtitle="Secure KHQR Payment" />
                <div class="flex flex-col items-center justify-center py-10 gap-4 text-center px-4">
                  <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-surface-800 dark:text-white">Failed to Generate QR</h3>
                  <p class="text-sm text-surface-400 max-w-xs">{{ store.error }}</p>
                  <div class="flex gap-3 mt-2">
                    <button
                      @click="store.startPayment()"
                      class="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      @click="store.closeSheet()"
                      class="px-6 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 font-semibold rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </template>

              <!-- ✅ QR & Pending State -->
              <template v-else-if="store.isPending">
                <!-- Header -->
                <KhqrHeader merchant-name="MY STORE" subtitle="Secure KHQR Payment" />

                <!-- Amount + Timer -->
                <div class="mt-5">
                  <KhqrTimer :amount="store.amount" />
                </div>

                <!-- QR Card -->
                <div class="mt-5">
                  <KhqrQrCard :qr-image="store.qrImage" />
                </div>

                <!-- Bank Icons -->
                <div class="mt-5">
                  <KhqrBankIcons />
                </div>

                <!-- Status -->
                <div class="mt-4">
                  <KhqrStatus />
                </div>
              </template>

              <!-- ✅ Success State -->
              <template v-else-if="store.isPaid">
                <!-- Replace QR Card with Success -->
                <div class="py-8">
                  <KhqrSuccess
                    :amount="store.amount"
                    :transaction-id="store.paidTransactionId"
                    :paid-time="store.paidTime"
                    merchant="MY STORE"
                    @continue="handleContinue"
                  />
                </div>
              </template>

              <!-- ⏰ Expired State -->
              <template v-else-if="store.isExpired">
                <div class="py-8">
                  <KhqrExpired
                    @generate="store.regenerateQR()"
                    @back="handleBack"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentStore } from '@/stores/payment.store'
import { useCartStore } from '@/stores/cart'
import KhqrHeader from './KhqrHeader.vue'
import KhqrTimer from './KhqrTimer.vue'
import KhqrQrCard from './KhqrQrCard.vue'
import KhqrBankIcons from './KhqrBankIcons.vue'
import KhqrStatus from './KhqrStatus.vue'
import KhqrSuccess from './KhqrSuccess.vue'
import KhqrExpired from './KhqrExpired.vue'

const router = useRouter()
const store = usePaymentStore()
const cartStore = useCartStore()

const isDesktop = computed(() => false) // CSS handles this

const sheetClasses = computed(() => {
  return [
    'h-[90vh] sm:h-auto sm:max-w-[420px] sm:my-8 sm:rounded-[28px] sm:mx-auto sm:relative sm:bottom-auto',
  ]
})

const scrollClasses = computed(() => {
  return ['sm:max-h-[80vh]']
})

function handleBackdropClick() {
  // Only allow closing when not in payment pending state
  if (store.status === 'IDLE' || store.status === 'ERROR' || store.isExpired) {
    store.closeSheet()
  }
}

function handleContinue() {
  cartStore.clearCart()
  store.closeSheet()
  router.push('/')
}

function handleBack() {
  store.closeSheet()
  router.push('/cart')
}

// Cleanup polling/countdown on unmount (user navigates away)
onUnmounted(() => {
  if (store.sheetOpen) {
    store.reset()
  }
})
</script>

<style scoped>
/* ─── Backdrop Transition ─── */
.backdrop-enter-active {
  transition: opacity 0.3s ease;
}
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* ─── Sheet Slide Transition ─── */
.sheet-enter-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-leave-active {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from {
  transform: translateY(100%);
}
.sheet-leave-to {
  transform: translateY(100%);
}

/* ─── Scrollbar ─── */
.h-full::-webkit-scrollbar {
  width: 4px;
}
.h-full::-webkit-scrollbar-track {
  background: transparent;
}
.h-full::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}
</style>
