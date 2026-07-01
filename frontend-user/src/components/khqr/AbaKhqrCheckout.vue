<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="store.abaSheetOpen"
        class="fixed inset-0 z-[999] bg-black/55 backdrop-blur-[10px]"
        @click.self="handleBackdropClick"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="sheet">
      <div
        v-if="store.abaSheetOpen"
        class="fixed inset-x-0 bottom-0 z-[1000] flex items-end justify-center"
      >
        <div
          class="relative w-full bg-white dark:bg-surface-800 rounded-[28px] shadow-[0_30px_100px_rgba(0,0,0,0.25)] overflow-hidden"
          :class="sheetClasses"
        >
          <div class="overflow-y-auto h-full" :class="scrollClasses">
            <div class="px-5 pb-8 pt-4">
              <!-- ⏳ Loading State -->
              <template v-if="store.abaIsLoading">
                <div class="flex flex-col items-center py-16 gap-4">
                  <!-- ABA Logo -->
                  <div class="w-14 h-14 bg-[#003288] rounded-full flex items-center justify-center shadow-lg">
                    <span class="text-white font-bold text-xl">A</span>
                  </div>
                  <div class="relative w-12 h-12">
                    <div class="absolute inset-0 border-4 border-[#E8F0FE] rounded-full" />
                    <div class="absolute inset-0 border-4 border-transparent border-t-[#003288] rounded-full animate-spin" />
                  </div>
                  <p class="text-sm font-medium text-surface-400">Generating ABA PayWay QR...</p>
                </div>
              </template>

              <!-- ❌ Error State -->
              <template v-else-if="store.abaStatus === 'ERROR'">
                <div class="flex flex-col items-center py-10 gap-4 text-center px-4">
                  <div class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-surface-800 dark:text-white">Failed to Generate QR</h3>
                  <p class="text-sm text-surface-400 max-w-xs">{{ store.abaError }}</p>
                  <div class="flex gap-3 mt-2">
                    <button @click="store.abaStartPayment()" class="px-6 py-2.5 bg-[#003288] text-white font-semibold rounded-xl hover:bg-[#002266] transition-all">Try Again</button>
                    <button @click="store.abaCloseSheet()" class="px-6 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 font-semibold rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-all">Cancel</button>
                  </div>
                </div>
              </template>

              <!-- ✅ QR & Pending State -->
              <template v-else-if="store.abaIsPending">
                <div class="w-full sm:max-w-[360px] mx-auto space-y-4">
                  <!-- Header -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-surface-100">
                        <svg viewBox="0 0 40 40" class="w-7 h-7">
                          <path d="M20 4 C 28 4, 36 10, 36 20 C 36 30, 28 36, 20 36 C 14 36, 8 32, 6 24 C 12 28, 22 28, 26 22 C 30 16, 28 8, 20 4 Z" fill="#E2001A"/>
                          <path d="M22 9 C 28 11, 32 16, 30 22 C 28 27, 22 28, 18 26 C 22 24, 26 20, 26 16 C 26 13, 24 10, 22 9 Z" fill="#003288"/>
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-surface-800 dark:text-white">ABA PayWay</p>
                        <p class="text-[11px] text-surface-400">Secure KHQR Payment</p>
                      </div>
                    </div>
                    <button @click="store.abaCloseSheet()" class="w-8 h-8 flex items-center justify-center rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors">
                      <svg class="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>

                  <!-- The Real KHQR Ticket -->
                  <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden relative">
                    <!-- Red header with handle + KHQR wordmark + corner fold -->
                    <div class="relative bg-[#E2001A]">
                      <div class="flex justify-center pt-2.5">
                        <div class="w-9 h-[3px] rounded-full bg-white/80"></div>
                      </div>
                      <div class="flex items-center justify-center pt-1.5 pb-3">
                        <span class="text-white font-extrabold text-[26px] tracking-[0.12em] leading-none select-none">KHQR</span>
                      </div>
                      <div class="absolute bottom-0 right-0 w-0 h-0" style="border-left: 16px solid transparent; border-bottom: 16px solid white;"></div>
                    </div>

                    <!-- Ticket body -->
                    <div class="px-6 pt-4 pb-6">
                      <p class="text-[11px] font-medium text-[#8B8B8B] truncate">{{ merchantName }}</p>
                      <div class="mt-1 flex items-baseline gap-1.5">
                        <p class="text-[22px] font-bold text-[#081b37] leading-none">{{ store.abaAmount.toFixed(2) }}</p>
                        <span class="text-[11px] font-medium text-[#081b37]">USD</span>
                      </div>

                      <div class="my-4 border-t-2 border-dashed border-surface-200"></div>

                      <div class="flex justify-center">
                        <div class="relative w-[228px] h-[228px] flex items-center justify-center">
                          <img v-if="store.abaQrImage" :src="store.abaQrImage" alt="ABA PayWay KHQR" class="w-full h-full object-contain" />
                          <div v-else class="w-full h-full bg-surface-50 rounded animate-pulse"></div>
                          <div v-if="store.abaQrImage" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[46px] h-[46px] rounded-full bg-white shadow flex items-center justify-center border border-surface-100">
                            <div class="w-[38px] h-[38px] rounded-full bg-[#003288] flex items-center justify-center">
                              <span class="text-white text-[9px] font-bold leading-none">ABA</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Countdown Timer -->
                  <div class="flex items-center justify-center gap-3 bg-surface-50 dark:bg-surface-700/50 rounded-xl py-3 px-5">
                    <svg class="w-5 h-5" :class="countdownColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-sm text-surface-500 dark:text-surface-400">Expires in</span>
                    <span class="text-sm font-bold w-12 text-center" :class="countdownTextClass">{{ store.abaFormattedTime }}</span>
                    <svg class="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" :stroke="countdownRingBg" stroke-width="3" />
                      <circle cx="18" cy="18" r="15" fill="none" :stroke="countdownRingColor" stroke-width="3" :stroke-dasharray="94.25" :stroke-dashoffset="countdownRingOffset" stroke-linecap="round" class="transition-all duration-1000 ease-linear" />
                    </svg>
                  </div>

                  <!-- Status Indicators -->
                  <div class="bg-surface-50 dark:bg-surface-700/30 rounded-xl p-4 space-y-3">
                    <div class="flex items-center gap-3">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="store.abaQrScanned ? 'bg-emerald-500' : 'bg-surface-300 dark:bg-surface-600'">
                        <svg v-if="store.abaQrScanned" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                        <span v-else class="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <span class="text-sm" :class="store.abaQrScanned ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-surface-500'">
                        {{ store.abaQrScanned ? 'QR Scanned' : 'Waiting for scan' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="store.abaPaymentApproved ? 'bg-emerald-500' : 'bg-surface-300 dark:bg-surface-600'">
                        <svg v-if="store.abaPaymentApproved" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                        <span v-else class="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <span class="text-sm" :class="store.abaPaymentApproved ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-surface-500'">
                        {{ store.abaPaymentApproved ? 'Payment Approved' : 'Waiting for approval' }}
                      </span>
                    </div>
                  </div>

                  <!-- Save QR + Supported apps -->
                  <div class="flex flex-col items-center gap-3">
                    <button
                      @click="downloadAbaQR"
                      class="inline-flex items-center gap-2 text-[#06b6d4] font-medium text-sm hover:text-[#0891b2] transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      Download QR
                    </button>
                    <p class="text-center text-xs text-surface-400">Scan with any banking app that supports KHQR</p>
                  </div>
                </div>
              </template>

              <!-- ✅ Success State -->
              <template v-else-if="store.abaIsPaid">
                <div class="py-8 text-center animate-fade-in px-4">
                  <div class="mx-auto w-[72px] h-[72px] bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-5 animate-bounce-in">
                    <div class="w-[52px] h-[52px] bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <path class="animate-draw-check" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <h2 class="text-[22px] font-bold text-surface-900 dark:text-white mb-1.5">Payment Successful</h2>
                  <p class="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-6 font-mono">${{ store.abaAmount.toFixed(2) }} <span class="text-lg">USD</span></p>

                  <div class="bg-surface-50 dark:bg-surface-800/80 rounded-xl p-4 border border-surface-100 dark:border-surface-700 mb-8 text-left space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-surface-500">Provider</span>
                      <span class="text-sm font-semibold text-surface-900 dark:text-surface-100">ABA PayWay</span>
                    </div>
                    <div v-if="store.abaPaidTransactionId" class="flex items-center justify-between">
                      <span class="text-sm font-medium text-surface-500">Transaction ID</span>
                      <span class="text-sm font-semibold text-surface-900 dark:text-surface-100 font-mono">{{ store.abaPaidTransactionId }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-surface-500">Time</span>
                      <span class="text-sm font-semibold text-surface-900 dark:text-surface-100">{{ store.abaPaidTime || formatNow() }}</span>
                    </div>
                  </div>

                  <div class="flex gap-3">
                    <button @click="handleContinue" class="flex-1 h-12 bg-[#003288] text-white font-semibold text-[15px] rounded-xl hover:bg-[#002266] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(0,50,136,0.3)]">Continue Shopping</button>
                    <button @click="handleViewOrder" class="flex-1 h-12 bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-200 font-semibold text-[15px] rounded-xl border border-surface-200 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-600 active:scale-[0.98] transition-all">View Order</button>
                  </div>
                </div>
              </template>

              <!-- ⏰ Expired State -->
              <template v-else-if="store.abaIsExpired">
                <div class="py-8 text-center animate-fade-in px-4">
                  <div class="mx-auto w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-5 animate-bounce-in">
                    <svg class="w-8 h-8 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h2 class="text-[20px] font-bold text-surface-900 dark:text-white mb-2">Payment Expired</h2>
                  <p class="text-[14px] text-surface-500 dark:text-surface-400 mb-8 max-w-[260px] mx-auto">The QR code has expired. Please generate a new one.</p>
                  <div class="space-y-3">
                    <button @click="store.abaGenerateNewQr()" class="w-full h-12 bg-[#003288] text-white font-semibold text-[15px] rounded-xl hover:bg-[#002266] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(0,50,136,0.3)]">Generate New QR</button>
                    <button @click="handleBackToCart" class="w-full h-12 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold text-[15px] rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700 active:scale-[0.98] transition-all">Back to Cart</button>
                  </div>
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
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePaymentStore } from '@/stores/payment.store'
import { useCartStore } from '@/stores/cart'
import api from '@/services/api'

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

function downloadAbaQR() {
  if (!store.abaQrImage) return
  const link = document.createElement('a')
  link.href = store.abaQrImage
  link.download = `ABA-KHQR-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const sheetClasses = computed(() => [
  'h-[90vh] sm:h-auto sm:max-w-[420px] sm:my-8 sm:rounded-[28px] sm:mx-auto sm:relative sm:bottom-auto',
])

const scrollClasses = computed(() => ['sm:max-h-[80vh]'])

const countdownColor = computed(() => {
  const s = store.abaCountdownSeconds
  if (s <= 30) return 'text-red-500'
  if (s <= 60) return 'text-amber-500'
  return 'text-emerald-500'
})

const countdownTextClass = computed(() => {
  const s = store.abaCountdownSeconds
  if (s <= 30) return 'text-red-500 animate-pulse'
  if (s <= 60) return 'text-amber-500'
  return 'text-emerald-600 dark:text-emerald-400'
})

const countdownRingColor = computed(() => {
  const s = store.abaCountdownSeconds
  if (s <= 30) return '#EF4444'
  if (s <= 60) return '#F59E0B'
  return '#10B981'
})

const countdownRingBg = computed(() => {
  const s = store.abaCountdownSeconds
  if (s <= 30) return '#FEE2E2'
  if (s <= 60) return '#FEF3C7'
  return '#D1FAE5'
})

const countdownRingOffset = computed(() => {
  return 94.25 * (1 - store.abaCountdownProgress)
})

function handleBackdropClick() {
  if (!store.abaIsPending) {
    store.abaCloseSheet()
  }
}

function handleContinue() {
  cartStore.clearCart()
  store.abaCloseSheet()
  router.push('/')
}

function handleViewOrder() {
  cartStore.clearCart()
  const id = store.abaOrderId
  store.abaCloseSheet()
  if (id) router.push(`/order/${id}`)
}

function handleBackToCart() {
  store.abaCloseSheet()
  router.push('/cart')
}

function formatNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<style scoped>
/* Reuse the same transition styles as KhqrCheckoutSheet */
.backdrop-enter-active { transition: opacity 0.3s ease; }
.backdrop-leave-active { transition: opacity 0.25s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.sheet-enter-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-leave-active { transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-enter-from { transform: translateY(100%); }
.sheet-leave-to { transform: translateY(100%); }

@keyframes pulse-qr {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.9; }
}
.animate-pulse-qr { animation: pulse-qr 2s ease-in-out infinite; }

@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes draw-check { from { stroke-dashoffset: 30; } to { stroke-dashoffset: 0; } }
@keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; }
.animate-draw-check { stroke-dasharray: 30; stroke-dashoffset: 30; animation: draw-check 0.5s ease-out 0.4s forwards; }
.animate-fade-in { animation: fade-in 0.4s ease-out forwards; }

.h-full::-webkit-scrollbar { width: 4px; }
.h-full::-webkit-scrollbar-track { background: transparent; }
.h-full::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 20px; }
</style>
