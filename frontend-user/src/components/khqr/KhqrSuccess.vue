<template>
  <div class="text-center animate-fade-in px-4">
    <!-- Success Icon with Beauty Gradient -->
    <div class="mx-auto w-20 h-20 bg-gradient-to-br from-[#FFD5E0] to-[#FFF4F7] rounded-full flex items-center justify-center mb-5 animate-bounce-in">
      <div class="w-14 h-14 bg-gradient-to-br from-[#FF7AA2] to-[#C084FC] text-white rounded-full flex items-center justify-center shadow-lg">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path class="animate-draw-check" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <h2 class="font-display text-2xl font-bold text-[#1A1A1A] mb-1">
      Payment Successful
    </h2>
    <p class="text-sm text-[#666666] mb-4">Your transaction has been completed</p>
    
    <div class="text-center mb-6">
      <p class="text-3xl font-bold text-[#1A1A1A] font-display">
        ${{ amount.toFixed(2) }}
        <span class="text-base font-medium text-[#666666]">USD</span>
      </p>
    </div>

    <!-- Details Box -->
    <div class="bg-[#FFF8FA] rounded-2xl p-4 border border-[#F1E6EA] mb-6 text-left space-y-2.5">
      <div v-if="transactionId" class="flex items-center justify-between">
        <span class="text-xs font-medium text-[#666666]">Transaction ID</span>
        <span class="text-xs font-semibold text-[#1A1A1A] font-mono">{{ transactionId }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-[#666666]">Merchant</span>
        <span class="text-xs font-semibold text-[#1A1A1A]">{{ merchant }}</span>
      </div>
      <div v-if="paidTime" class="flex items-center justify-between">
        <span class="text-xs font-medium text-[#666666]">Time</span>
        <span class="text-xs font-semibold text-[#1A1A1A]">{{ paidTime }}</span>
      </div>
    </div>

    <!-- Done Button -->
    <button
      @click="$emit('continue')"
      class="w-full h-12 bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] text-white font-semibold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-button focus:outline-none"
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
.animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; }
.animate-draw-check { stroke-dasharray: 30; stroke-dashoffset: 30; animation: draw-check 0.5s ease-out 0.4s forwards; }
.animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
</style>
