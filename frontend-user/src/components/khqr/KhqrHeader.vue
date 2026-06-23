<template>
  <section class="pt-3 pb-1">
    <div class="flex justify-center">
      <div class="w-12 h-[5px] rounded-full bg-[#D9D9D9]" />
    </div>

    <div class="mt-4 flex flex-col items-center gap-3 text-center px-4">
      <div class="w-12 h-12 rounded-full bg-[#EAF2FF] flex items-center justify-center">
        <span class="text-lg font-semibold text-[#0055A4]">{{ initial }}</span>
      </div>
      <div>
        <p class="text-base font-semibold text-slate-900 tracking-tight">{{ merchantName }}</p>
        <p class="mt-1 text-sm text-[#8B8B8B]">{{ subtitle }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
'use strict'

const props = defineProps<{
  merchantName?: string
  subtitle?: string
}>()

const initial = props.merchantName?.trim().charAt(0).toUpperCase() || 'M'
</script>
