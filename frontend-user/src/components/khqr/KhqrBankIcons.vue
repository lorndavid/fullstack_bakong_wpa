<template>
  <div class="flex items-center justify-center gap-3 flex-wrap">
    <div
      v-for="bank in banks"
      :key="bank.name"
      class="flex flex-col items-center gap-1.5 group"
    >
      <div
        class="w-12 h-12 rounded-xl bg-white dark:bg-surface-700 shadow-sm border border-surface-100 dark:border-surface-600 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-md overflow-hidden"
      >
        <!-- ─── ABA Bank (red leaf + blue) ─── -->
        <svg v-if="bank.name === 'ABA'" viewBox="0 0 40 40" class="w-8 h-8">
          <path
            d="M20 4 C 28 4, 36 10, 36 20 C 36 30, 28 36, 20 36 C 14 36, 8 32, 6 24 C 12 28, 22 28, 26 22 C 30 16, 28 8, 20 4 Z"
            fill="#E2001A"/>
          <path
            d="M22 9 C 28 11, 32 16, 30 22 C 28 27, 22 28, 18 26 C 22 24, 26 20, 26 16 C 26 13, 24 10, 22 9 Z"
            fill="#003288"/>
        </svg>

        <!-- ─── ACLEDA Bank (blue + red angel wings) ─── -->
        <svg v-else-if="bank.name === 'ACLEDA'" viewBox="0 0 40 40" class="w-7 h-7">
          <rect width="40" height="40" rx="8" fill="#003D79"/>
          <path d="M20 8 C20 8, 12 16, 12 22 C12 27, 16 32, 20 32 C24 32, 28 27, 28 22 C28 16, 20 8, 20 8Z" fill="white" opacity="0.95"/>
          <path d="M20 12 C20 12, 15 17, 15 21 C15 26, 17 29, 20 29 C23 29, 25 26, 25 21 C25 17, 20 12, 20 12Z" fill="#ED1C24"/>
          <circle cx="20" cy="21" r="3" fill="white"/>
        </svg>

        <!-- ─── WING Bank (teal wing) ─── -->
        <svg v-else-if="bank.name === 'WING'" viewBox="0 0 40 40" class="w-7 h-7">
          <rect width="40" height="40" rx="8" fill="#00843D"/>
          <path d="M8 26 C 12 18, 20 14, 32 14 C 28 18, 20 22, 8 26 Z" fill="white"/>
          <path d="M10 30 C 14 24, 22 20, 32 22 C 28 24, 22 26, 10 30 Z" fill="white" opacity="0.7"/>
        </svg>

        <!-- ─── BAKONG (KHQR red) ─── -->
        <svg v-else-if="bank.name === 'Bakong'" viewBox="0 0 40 40" class="w-8 h-8">
          <rect width="40" height="40" rx="8" fill="#E2001A"/>
          <g fill="white">
            <rect x="6" y="6" width="4" height="4" rx="1"/>
            <rect x="30" y="6" width="4" height="4" rx="1"/>
            <rect x="6" y="30" width="4" height="4" rx="1"/>
          </g>
          <text x="20" y="24" text-anchor="middle" fill="white" font-family="Arial Black, Arial, sans-serif" font-size="9" font-weight="900" letter-spacing="0.5">KHQR</text>
        </svg>

        <!-- ─── SATHAPANA ─── -->
        <svg v-else-if="bank.name === 'Sathapana'" viewBox="0 0 40 40" class="w-7 h-7">
          <rect width="40" height="40" rx="8" fill="#003878"/>
          <path d="M14 14 C14 14, 18 11, 22 14 C26 17, 14 23, 18 26 C22 29, 26 26, 26 26" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>

        <!-- ─── CANADIA (red C) ─── -->
        <svg v-else-if="bank.name === 'Canadia'" viewBox="0 0 40 40" class="w-7 h-7">
          <rect width="40" height="40" rx="8" fill="#D7142A"/>
          <path d="M28 14 a 8 8 0 1 0 0 12" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="text-[10px] font-medium text-surface-400 dark:text-surface-500 transition-colors group-hover:text-surface-600 dark:group-hover:text-surface-300">
        {{ bank.label }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Bank {
  name: string
  label: string
}

const banks: Bank[] = [
  { name: 'ABA', label: 'ABA' },
  { name: 'ACLEDA', label: 'ACLEDA' },
  { name: 'WING', label: 'Wing' },
  { name: 'Bakong', label: 'Bakong' },
  { name: 'Canadia', label: 'Canadia' },
  { name: 'Sathapana', label: 'Sathapana' },
]
</script>
