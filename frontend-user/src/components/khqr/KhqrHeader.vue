<template>
  <section class="pt-3 pb-1">
    <div class="flex justify-center">
      <div class="w-12 h-[5px] rounded-full bg-[#F1E6EA]" />
    </div>

    <div class="mt-4 flex flex-col items-center gap-3 text-center px-4">
      <div class="w-14 h-14 bg-gradient-to-br from-[#FF7AA2] to-[#C084FC] rounded-2xl flex items-center justify-center shadow-elevated">
        <span class="text-xl font-bold text-white">{{ initial }}</span>
      </div>
      <div>
        <p class="font-display text-base font-bold text-[#1A1A1A] tracking-tight">{{ merchantName }}</p>
        <p class="mt-1 text-xs text-[#666666]">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Decorative gradient line -->
    <div class="mt-4 mx-6 h-px bg-gradient-to-r from-transparent via-[#F8D7E3] to-transparent"></div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  merchantName?: string
  subtitle?: string
}>()

const initial = props.merchantName?.trim().charAt(0).toUpperCase() || 'G'
</script>
