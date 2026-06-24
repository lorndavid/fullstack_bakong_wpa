<template>
  <div class="rounded-2xl bg-white p-4 sm:p-5 border border-[#F1E6EA] shadow-card">
    <div class="relative flex items-center justify-center">
      <div class="absolute inset-0 rounded-2xl bg-[#FFF4F7] opacity-60" />
      <div class="relative w-[220px] h-[220px] rounded-2xl bg-white p-3 border border-[#F8D7E3]">
        <img
          v-if="qrImage"
          :src="qrImage"
          alt="KHQR Code"
          class="w-full h-full object-contain rounded-xl"
        />
        <div
          v-else
          class="w-full h-full rounded-xl bg-[#FFF8FA] flex items-center justify-center"
        >
          <svg class="w-14 h-14 text-[#F1E6EA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4h6v6H4V4zm0 10h6v6H4v-6zm10-10h6v6h-6V4zm0 10h6v6h-6v-6z"/>
          </svg>
        </div>
      </div>
    </div>

    <p class="mt-3 text-center text-xs text-[#666666] font-medium">
      Scan using your banking app
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  qrImage: string
}>()
</script>
