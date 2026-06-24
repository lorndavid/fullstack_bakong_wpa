<template>
  <div class="flex items-center justify-between p-4 bg-[#FFF8FA] rounded-2xl border border-[#F1E6EA]">
    <!-- Amount -->
    <div>
      <p class="text-[10px] font-semibold text-[#666666] uppercase tracking-wider mb-0.5">Amount</p>
      <p class="text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-none font-display">
        ${{ amount.toFixed(2) }}
      </p>
      <p class="text-[10px] text-[#666666] mt-0.5 font-medium">USD</p>
    </div>

    <!-- Countdown Ring -->
    <div class="relative w-[68px] h-[68px] flex-shrink-0">
      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
        <!-- Background ring -->
        <circle
          cx="36" cy="36" r="31"
          fill="none"
          :stroke="bgRingColor"
          stroke-width="3.5"
        />
        <!-- Progress ring -->
        <circle
          cx="36" cy="36" r="31"
          fill="none"
          :stroke="ringColor"
          stroke-width="3.5"
          :stroke-dasharray="194.78"
          :stroke-dashoffset="ringOffset"
          stroke-linecap="round"
          class="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center leading-tight">
        <span class="text-[9px] font-medium" :class="textClass">Time</span>
        <span class="text-sm font-bold leading-none" :class="[textClass, { 'animate-pulse': seconds <= 30 }]">
          {{ formatted }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePaymentStore } from '@/stores/payment.store'

const props = defineProps<{
  amount: number
}>()

const store = usePaymentStore()

const seconds = computed(() => store.countdownSeconds)
const formatted = computed(() => store.formattedTime)
const progress = computed(() => store.countdownProgress)
const color = computed(() => store.countdownColor)

const ringOffset = computed(() => 194.78 * (1 - progress.value))

const ringColor = computed(() => {
  if (color.value === 'red') return '#FF7AA2'
  if (color.value === 'orange') return '#C084FC'
  return '#FF7AA2'
})

const bgRingColor = computed(() => {
  if (color.value === 'red') return '#FDE8F0'
  if (color.value === 'orange') return '#F5F3FF'
  return '#FDE8F0'
})

const textClass = computed(() => {
  if (color.value === 'red') return 'text-[#FF7AA2]'
  if (color.value === 'orange') return 'text-[#C084FC]'
  return 'text-[#FF7AA2]'
})
</script>
