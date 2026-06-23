<template>
  <div class="rounded-[24px] bg-white p-6 shadow-[0_24px_64px_rgba(0,0,0,0.12)]">
    <div class="relative flex items-center justify-center">
      <div class="absolute inset-0 rounded-[28px] bg-[#E3F5FF] opacity-70 animate-pulse-qr" />
      <div class="relative w-[260px] h-[260px] rounded-[28px] bg-white p-4 shadow-inner">
        <img
          v-if="qrImage"
          :src="qrImage"
          alt="KHQR Code"
          class="w-full h-full object-contain rounded-[22px]"
        />
        <div
          v-else
          class="w-full h-full rounded-[22px] bg-slate-50 flex items-center justify-center"
        >
          <svg class="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4h6v6H4V4zm0 10h6v6H4v-6zm10-10h6v6h-6V4zm0 10h6v6h-6v-6z"/>
          </svg>
        </div>
      </div>
    </div>

    <p class="mt-5 text-center text-sm text-[#777]">Scan using your banking app</p>
  </div>
</template>

<script setup lang="ts">
'use strict'

defineProps<{
  qrImage: string
}>()
</script>

<style scoped>
@keyframes pulse-qr {
  0%, 100% { transform: scale(0.98); opacity: 0.55; }
  50% { transform: scale(1.02); opacity: 1; }
}
.animate-pulse-qr {
  animation: pulse-qr 2s ease-in-out infinite;
}
</style>
