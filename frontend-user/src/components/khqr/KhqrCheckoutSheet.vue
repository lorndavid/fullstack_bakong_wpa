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
                <KhqrHeader :merchant-name="merchantName" subtitle="Secure KHQR Payment" />
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

              <!-- ✅ QR & Pending State — Real KHQR Ticket -->
              <template v-else-if="store.isPending">
                <div class="w-full sm:max-w-[360px] mx-auto">
                  <!-- The Real KHQR Ticket -->
                  <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden relative">

                    <!-- Red Header with handle + KHQR logo + corner fold -->
                    <div class="relative bg-[#E2001A]">
                      <!-- Drag handle -->
                      <div class="flex justify-center pt-2.5">
                        <div class="w-9 h-[3px] rounded-full bg-white/80"></div>
                      </div>
                      <!-- KHQR wordmark -->
                      <div class="flex items-center justify-center pt-1.5 pb-3">
                        <span class="text-white font-extrabold text-[26px] tracking-[0.12em] leading-none select-none">
                          KHQR
                        </span>
                      </div>
                      <!-- Corner fold (white triangle bottom-right) -->
                      <div class="absolute bottom-0 right-0 w-0 h-0"
                        style="border-left: 16px solid transparent; border-bottom: 16px solid white;"></div>
                    </div>

                    <!-- Ticket body -->
                    <div class="px-6 pt-4 pb-6">
                      <!-- Merchant + amount -->
                      <p class="text-[11px] font-medium text-[#8B8B8B] truncate">{{ merchantName }}</p>
                      <div class="mt-1 flex items-baseline gap-1.5">
                        <p class="text-[22px] font-bold text-[#081b37] leading-none">{{ store.amount.toFixed(2) }}</p>
                        <span class="text-[11px] font-medium text-[#081b37]">USD</span>
                      </div>

                      <!-- Dashed divider -->
                      <div class="my-4 border-t-2 border-dashed border-surface-200"></div>

                      <!-- QR with center logo overlay -->
                      <div class="flex justify-center">
                        <div class="relative w-[228px] h-[228px] flex items-center justify-center">
                          <img
                            v-if="store.qrImage"
                            :src="store.qrImage"
                            alt="KHQR Code"
                            class="w-full h-full object-contain"
                          />
                          <div v-else class="w-full h-full bg-surface-50 rounded animate-pulse"></div>
                          <!-- Center USD circle badge -->
                          <div v-if="store.qrImage" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[46px] h-[46px] rounded-full bg-white shadow flex items-center justify-center border border-surface-100">
                            <div class="w-[38px] h-[38px] rounded-full bg-[#E2001A] flex items-center justify-center">
                              <span class="text-white text-[10px] font-bold leading-none">USD</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Footer / status area -->
                  <div class="mt-5 flex flex-col items-center">
                    <!-- Timer -->
                    <div class="flex items-center gap-2 mb-4 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 px-4 py-2 rounded-full shadow-sm">
                      <svg class="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span class="text-sm font-medium text-surface-600 dark:text-surface-300">Expires in</span>
                      <span
                        class="text-sm font-bold w-12 text-center"
                        :class="store.countdownSeconds <= 30 ? 'text-[#E2001A] animate-pulse' : 'text-[#081b37] dark:text-primary-300'"
                      >
                        {{ store.formattedTime }}
                      </span>
                    </div>

                    <p class="text-[15px] font-semibold text-[#081b37] dark:text-white">Scan to Pay</p>
                    <p class="text-sm text-surface-400 my-0.5">or</p>

                    <!-- Download button -->
                    <button
                      @click="downloadQR"
                      class="inline-flex items-center gap-2 text-[#06b6d4] font-medium text-sm hover:text-[#0891b2] transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      Download QR
                    </button>
                    <p class="text-xs text-surface-400 text-center max-w-[220px] mt-2 leading-relaxed">
                      and upload to any Mobile Banking app supporting KHQR
                    </p>

                    <!-- Supported apps -->
                    <div class="mt-5 w-full">
                      <p class="text-[11px] font-medium text-surface-400 uppercase tracking-widest mb-2 text-center">Supported Apps</p>
                      <KhqrBankIcons />
                    </div>

                    <!-- Cancel -->
                    <button
                      @click="store.closeSheet()"
                      class="mt-6 w-full h-11 flex items-center justify-center bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 font-semibold text-sm rounded-xl hover:bg-surface-200 dark:hover:bg-surface-700 active:scale-[0.98] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
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
                    :merchant="merchantName"
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
import { computed, onUnmounted, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentStore } from '@/stores/payment.store'
import { useCartStore } from '@/stores/cart'
import api from '@/services/api'
import KhqrBankIcons from './KhqrBankIcons.vue'
import KhqrHeader from './KhqrHeader.vue'
import KhqrSuccess from './KhqrSuccess.vue'
import KhqrExpired from './KhqrExpired.vue'

const router = useRouter()
const store = usePaymentStore()
const cartStore = useCartStore()

const merchantName = ref('MY STORE')

onMounted(async () => {
  try {
    const data: any = await api.get('/settings')
    const s = data.settings || {}
    merchantName.value = s.payment?.merchantName || s.siteName || 'MY STORE'
  } catch {
    // keep default
  }
})

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

function downloadQR() {
  if (!store.qrImage) return
  
  const link = document.createElement('a')
  link.href = store.qrImage
  link.download = `KHQR-Payment-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
