<template>
  <div class="text-center animate-fade-in px-2">
    <!-- Animated Check Circle -->
    <div class="relative mx-auto mb-7 w-[100px] h-[100px]">
      <div class="absolute inset-0 bg-emerald-500/15 rounded-full animate-ping-slow" />
      <div
        class="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 animate-bounce-in"
      >
        <svg class="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path class="animate-draw-check" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <h2 class="text-2xl sm:text-3xl font-bold text-[#00A854] dark:text-emerald-400 mb-2">
      Payment Successful
    </h2>
    <p class="text-4xl font-bold text-surface-900 dark:text-white mb-6">
      ${{ amount.toFixed(2) }}
    </p>

    <!-- Details Card -->
    <div class="bg-gradient-to-b from-[#E7FFF0] to-white dark:from-emerald-900/10 dark:to-surface-800/50 backdrop-blur-sm rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800/20 shadow-sm mb-6 text-left space-y-3">
      <div v-if="transactionId" class="flex items-center justify-between text-sm">
        <span class="text-surface-400">Transaction ID</span>
        <span class="font-mono text-xs text-surface-700 dark:text-surface-300 font-semibold truncate ml-2 max-w-[180px]">
          {{ transactionId }}
        </span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-surface-400">Merchant</span>
        <span class="text-surface-700 dark:text-surface-300 font-semibold">{{ merchant }}</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-surface-400">Paid at</span>
        <span class="text-surface-700 dark:text-surface-300 font-semibold">{{ paidTime }}</span>
      </div>
    </div>

    <!-- Button -->
    <button
      @click="$emit('continue')"
      class="w-full h-[52px] bg-primary-500 text-white font-semibold text-base rounded-2xl hover:bg-primary-600 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/30 shadow-lg shadow-primary-500/25"
    >
      Continue Shopping
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  amount: number
  transactionId?: string | null
  merchant?: string
  paidTime?: string | null
}>()

defineEmits<{
  continue: []
}>()
</script>

<style scoped>
@keyframes ping-slow {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.5); opacity: 0; }
}
@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes draw-check {
  from { stroke-dashoffset: 30; }
  to { stroke-dashoffset: 0; }
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-ping-slow { animation: ping-slow 2s ease-out infinite; }
.animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; }
.animate-draw-check { stroke-dasharray: 30; stroke-dashoffset: 30; animation: draw-check 0.5s ease-out 0.4s forwards; }
.animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
</style>
