<template>
  <div class="text-center animate-fade-in px-4 py-4">
    <!-- Soft Error Icon -->
    <div class="mx-auto w-16 h-16 bg-[#FFF4F7] rounded-full flex items-center justify-center mb-4 animate-bounce-in">
      <div class="w-12 h-12 bg-[#F8D7E3] rounded-full flex items-center justify-center">
        <svg class="w-6 h-6 text-[#FF7AA2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
    </div>

    <h2 class="font-display text-xl font-bold text-[#1A1A1A] mb-2">QR Code Expired</h2>
    <p class="text-sm text-[#666666] mb-7 max-w-[240px] mx-auto leading-relaxed">
      This payment code is no longer valid. Please generate a new one to proceed.
    </p>

    <div class="space-y-3">
      <button
        @click="$emit('generate')"
        class="w-full h-12 bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] text-white font-semibold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-button focus:outline-none"
      >
        Generate New QR
      </button>
      <button
        @click="$emit('back')"
        class="w-full h-12 bg-white text-[#666666] font-semibold text-sm rounded-xl border border-[#F1E6EA] hover:bg-[#FFF8FA] active:scale-[0.98] transition-all"
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
