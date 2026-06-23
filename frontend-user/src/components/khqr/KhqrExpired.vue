<template>
  <div class="text-center animate-fade-in px-4 py-4">
    <!-- Simple Error Icon -->
    <div class="mx-auto w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-5 animate-bounce-in">
      <svg class="w-8 h-8 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>

    <h2 class="text-[20px] font-bold text-surface-900 dark:text-white mb-2">QR Code Expired</h2>
    <p class="text-[14px] text-surface-500 dark:text-surface-400 mb-8 max-w-[260px] mx-auto leading-relaxed">
      This payment code is no longer valid. Please generate a new one to proceed.
    </p>

    <div class="space-y-3">
      <button
        @click="$emit('generate')"
        class="w-full h-12 bg-[#E2001A] text-white font-semibold text-[15px] rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all focus:outline-none shadow-[0_4px_14px_rgba(226,0,26,0.3)]"
      >
        Generate New QR
      </button>
      <button
        @click="$emit('back')"
        class="w-full h-12 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold text-[15px] rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700 active:scale-[0.98] transition-all"
      >
        Cancel
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
