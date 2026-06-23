<template>
  <div class="flex items-center justify-between p-5 bg-[#F7F8FA] dark:bg-surface-800/50 rounded-2xl">
    <!-- Amount -->
    <div>
      <p class="text-xs font-medium text-surface-400 uppercase tracking-wider mb-0.5">Amount</p>
      <p class="text-3xl sm:text-4xl font-bold text-[#0055A4] dark:text-primary-300 leading-none">
        ${{ amount.toFixed(2) }}
      </p>
      <p class="text-xs text-surface-400 mt-1 font-medium">USD</p>
    </div>

    <!-- Countdown Ring -->
    <div class="relative w-[72px] h-[72px] flex-shrink-0">
      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
        <!-- Background ring -->
        <circle
          cx="36" cy="36" r="31"
          fill="none"
          :stroke="ringBgColor"
          stroke-width="4"
        />
        <!-- Progress ring -->
        <circle
          cx="36" cy="36" r="31"
          fill="none"
          :stroke="ringColor"
          stroke-width="4"
          :stroke-dasharray="194.78"
          :stroke-dashoffset="ringOffset"
          stroke-linecap="round"
          class="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center leading-tight">
        <span class="text-[10px] font-medium" :class="ringTextClass">Time</span>
        <span class="text-sm font-bold leading-none" :class="[ringTextClass, { 'animate-pulse': seconds <= 30 }]">
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
  if (color.value === 'red') return '#EF4444'
  if (color.value === 'orange') return '#F59E0B'
  return '#10B981'
})

const ringBgColor = computed(() => {
  if (color.value === 'red') return '#FEE2E2'
  if (color.value === 'orange') return '#FEF3C7'
  return '#D1FAE5'
})

const ringTextClass = computed(() => {
  if (color.value === 'red') return 'text-red-500'
  if (color.value === 'orange') return 'text-amber-500'
  return 'text-emerald-600 dark:text-emerald-400'
})
</script>
