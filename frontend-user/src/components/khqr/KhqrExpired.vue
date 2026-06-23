<template>
  <div class="text-center animate-fade-in px-6 bg-[#FFF4F4] dark:bg-red-900/20 rounded-2xl py-8">
    <!-- Red Icon -->
    <div class="mx-auto w-[88px] h-[88px] bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce-in">
      <svg class="w-11 h-11 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    </div>

    <h2 class="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Payment Expired</h2>
    <p class="text-sm text-surface-400 mb-8">The QR code has expired. Please generate a new one to complete your payment.</p>

    <div class="space-y-3">
      <button
        @click="$emit('generate')"
        class="w-full h-[52px] bg-primary-500 text-white font-semibold text-base rounded-2xl hover:bg-primary-600 active:scale-[0.98] transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/30 shadow-lg shadow-primary-500/25"
      >
        Generate New QR
      </button>
      <button
        @click="$emit('back')"
        class="w-full h-[52px] bg-white dark:bg-surface-700 text-surface-600 dark:text-surface-300 font-semibold text-base rounded-2xl border border-surface-200 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-600 active:scale-[0.98] transition-all"
      >
        Back to Cart
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  generate: []
  back: []
}>()
</script>

<style scoped>
@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; }
.animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
</style>
