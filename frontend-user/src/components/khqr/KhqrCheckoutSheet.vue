<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="store.sheetOpen"
        class="fixed inset-0 z-[999] bg-black/45 backdrop-blur-[6px]"
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
          class="relative w-full bg-white dark:bg-surface-800 rounded-[24px] shadow-modal overflow-hidden"
          :class="sheetClasses"
        >
          <!-- Scrollable Content -->
          <div class="overflow-y-auto h-full" :class="scrollClasses">
            <div class="px-5 pb-8 pt-3">
              <!-- ⏳ Loading State -->
              <template v-if="store.isLoading">
                <KhqrHeader merchant-name="GLOW BEAUTY" subtitle="Secure KHQR Payment" />
                <div class="flex flex-col items-center justify-center py-16 gap-4">
                  <div class="relative w-14 h-14">
                    <div class="absolute inset-0 border-3 border-[#FDE8F0] rounded-full" />
                    <div class="absolute inset-0 border-3 border-transparent border-t-[#FF7AA2] rounded-full animate-spin" />
                  </div>
                  <p class="text-sm font-medium text-[#666666]">Generating QR Code...</p>
                </div>
              </template>

              <!-- ❌ Error State -->
              <template v-else-if="store.status === 'ERROR'">
                <KhqrHeader merchant-name="GLOW BEAUTY" subtitle="Secure KHQR Payment" />
                <div class="flex flex-col items-center justify-center py-10 gap-4 text-center px-4">
                  <div class="w-16 h-16 bg-[#FFF4F7] rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-[#FF7AA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                  </div>
                  <h3 class="font-display text-lg font-bold text-[#1A1A1A]">Failed to Generate QR</h3>
                  <p class="text-sm text-[#666666] max-w-xs">{{ store.error }}</p>
                  <div class="flex gap-3 mt-2">
                    <button
                      @click="store.startPayment()"
                      class="px-6 py-2.5 bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all shadow-button"
                    >
                      Try Again
                    </button>
                    <button
                      @click="store.closeSheet()"
                      class="px-6 py-2.5 border border-[#F1E6EA] text-[#666666] font-semibold text-sm rounded-xl hover:bg-[#FFF8FA] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </template>

              <!-- ✅ QR & Pending State -->
              <template v-else-if="store.isPending">
                <div class="w-full sm:max-w-[360px] mx-auto">
                  <!-- Beauty Pink KHQR Ticket -->
                  <div class="bg-white rounded-2xl border border-[#F1E6EA] shadow-card overflow-hidden">
                    <!-- Pink Gradient Header -->
                    <div class="relative bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] h-14 flex items-center justify-center">
                      <div class="absolute -bottom-1 -right-2 w-6 h-6 bg-white rotate-45 transform origin-bottom-right"></div>
                      <div class="text-white font-display font-bold text-xl tracking-[0.1em] flex items-center select-none">
                        <span>GLOW</span>
                        <span class="font-light mx-1">✦</span>
                        <span>PAY</span>
                      </div>
                    </div>

                    <!-- Ticket Content -->
                    <div class="px-5 pt-5 pb-5 relative">
                      <!-- Edge cutouts for ticket effect -->
                      <div class="absolute -left-[10px] top-24 w-5 h-5 bg-white rounded-full shadow-inner border border-[#F1E6EA]"></div>
                      <div class="absolute -right-[10px] top-24 w-5 h-5 bg-white rounded-full shadow-inner border border-[#F1E6EA]"></div>

                      <!-- Merchant & Amount -->
                      <p class="text-xs font-semibold text-[#666666] uppercase tracking-wider">
                        LORN DAVIT ONLINE
                      </p>
                      <div class="mt-1.5 flex items-baseline gap-1.5">
                        <p class="text-2xl font-bold text-[#1A1A1A] font-display">
                          {{ store.amount.toFixed(2) }}
                        </p>
                        <span class="text-xs font-bold text-[#666666] uppercase">USD</span>
                      </div>

                      <!-- Dashed Separator -->
                      <div class="my-4 border-t-2 border-dashed border-[#F1E6EA] relative z-10"></div>

                      <!-- QR Code -->
                      <div class="flex justify-center relative z-10">
                        <div class="relative w-full aspect-square max-w-[220px] bg-white rounded-xl p-2 border border-[#F8D7E3]">
                          <img 
                            v-if="store.qrImage" 
                            :src="store.qrImage" 
                            alt="KHQR Code" 
                            class="w-full h-full object-contain" 
                          />
                          <div v-else class="w-full h-full bg-[#FFF8FA] rounded-lg animate-pulse"></div>
                        </div>
                      </div>

                      <!-- Status Indicator -->
                      <div class="mt-4">
                        <KhqrStatus />
                      </div>
                    </div>
                  </div>

                  <!-- Footer / Timer & Actions -->
                  <div class="mt-5 space-y-4">
                    <!-- Timer -->
                    <KhqrTimer :amount="store.amount" />

                    <!-- Action Buttons -->
                    <div class="flex items-center justify-center gap-3">
                      <button 
                        @click="downloadQR" 
                        class="flex-1 h-11 flex items-center justify-center gap-2 bg-white text-[#666666] font-semibold text-sm rounded-xl border border-[#F1E6EA] hover:bg-[#FFF8FA] hover:border-[#FF7AA2] active:scale-[0.98] transition-all"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Save QR
                      </button>
                      <button 
                        @click="store.closeSheet()" 
                        class="flex-1 h-11 flex items-center justify-center gap-2 bg-[#FFF8FA] text-[#666666] font-semibold text-sm rounded-xl border border-[#F1E6EA] hover:bg-[#FFF4F7] active:scale-[0.98] transition-all"
                      >
                        Cancel
                      </button>
                    </div>

                    <p class="text-center text-[10px] font-semibold text-[#C4A8B6] uppercase tracking-widest">
                      Supported Banking Apps
                    </p>
                    <KhqrBankIcons />
                  </div>
                </div>
              </template>

              <!-- ✅ Success State -->
              <template v-else-if="store.isPaid">
                <div class="py-6">
                  <KhqrSuccess
                    :amount="store.amount"
                    :transaction-id="store.paidTransactionId"
                    :paid-time="store.paidTime"
                    merchant="GLOW BEAUTY"
                    @continue="handleContinue"
                  />
                </div>
              </template>

              <!-- ⏰ Expired State -->
              <template v-else-if="store.isExpired">
                <div class="py-6">
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
import KhqrBankIcons from './KhqrBankIcons.vue'
import KhqrHeader from './KhqrHeader.vue'
import KhqrTimer from './KhqrTimer.vue'
import KhqrStatus from './KhqrStatus.vue'
import KhqrSuccess from './KhqrSuccess.vue'
import KhqrExpired from './KhqrExpired.vue'

const router = useRouter()
const store = usePaymentStore()
const cartStore = useCartStore()

const sheetClasses = computed(() => {
  return [
    'h-[90vh] sm:h-auto sm:max-w-[400px] sm:my-8 sm:rounded-[24px] sm:mx-auto sm:relative sm:bottom-auto',
  ]
})

const scrollClasses = computed(() => {
  return ['sm:max-h-[80vh]']
})

function handleBackdropClick() {
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

onUnmounted(() => {
  if (store.sheetOpen) {
    store.reset()
  }
})
</script>

<style scoped>
/* ─── Backdrop Transition ─── */
.backdrop-enter-active { transition: opacity 0.3s ease; }
.backdrop-leave-active { transition: opacity 0.25s ease; }
.backdrop-enter-from,
.backdrop-leave-to { opacity: 0; }

/* ─── Sheet Slide Transition ─── */
.sheet-enter-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-leave-active { transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-enter-from { transform: translateY(100%); }
.sheet-leave-to { transform: translateY(100%); }

/* ─── Scrollbar ─── */
.h-full::-webkit-scrollbar { width: 4px; }
.h-full::-webkit-scrollbar-track { background: transparent; }
.h-full::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.08); border-radius: 20px; }
</style>
