<template>
  <div class="text-center animate-fade-in px-4">
    <!-- Clean Success Icon -->
    <div class="mx-auto w-[72px] h-[72px] bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-5 animate-bounce-in">
      <div class="w-[52px] h-[52px] bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path class="animate-draw-check" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <h2 class="text-[22px] font-bold text-surface-900 dark:text-white mb-1.5">
      Payment Successful
    </h2>
    <p class="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-6 font-mono tracking-tight">
      ${{ amount.toFixed(2) }} <span class="text-lg">USD</span>
    </p>

    <!-- Details Box -->
    <div class="bg-surface-50 dark:bg-surface-800/80 rounded-xl p-4 border border-surface-100 dark:border-surface-700 mb-8 text-left space-y-3">
      <div v-if="transactionId" class="flex items-center justify-between">
        <span class="text-sm font-medium text-surface-500">Transaction ID</span>
        <span class="text-sm font-semibold text-surface-900 dark:text-surface-100 font-mono tracking-tight">{{ transactionId }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-surface-500">Merchant</span>
        <span class="text-sm font-semibold text-surface-900 dark:text-surface-100">{{ merchant }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-surface-500">Time</span>
        <span class="text-sm font-semibold text-surface-900 dark:text-surface-100">{{ paidTime }}</span>
      </div>
    </div>

    <!-- Done Button -->
    <button
      @click="$emit('continue')"
      class="w-full h-12 bg-[#E2001A] text-white font-semibold text-[15px] rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all focus:outline-none shadow-[0_4px_14px_rgba(226,0,26,0.3)]"
    >
      Done
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
