<template>
  <div class="flex items-center justify-center gap-4">
    <div
      v-for="bank in banks"
      :key="bank.name"
      class="flex flex-col items-center gap-1.5 group"
    >
      <div
        class="w-11 h-11 rounded-xl bg-[#FFF8FA] border border-[#F1E6EA] flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-soft group-hover:border-[#FF7AA2]"
      >
        <!-- ─── ABA Bank ──────────────────────────────────── -->
        <svg v-if="bank.name === 'ABA'" viewBox="0 0 40 40" class="w-6 h-6">
          <circle cx="20" cy="20" r="18" fill="#003288"/>
          <circle cx="20" cy="20" r="14" fill="none" stroke="white" stroke-width="2.5"/>
          <text x="20" y="25" text-anchor="middle" fill="white" font-size="13" font-weight="bold" font-family="Arial, sans-serif">A</text>
        </svg>

        <!-- ─── ACLEDA ───────────────────────────────────── -->
        <svg v-else-if="bank.name === 'ACLEDA'" viewBox="0 0 40 40" class="w-6 h-6">
          <rect width="40" height="40" rx="8" fill="#003D79"/>
          <path d="M20 8 C20 8, 12 16, 12 22 C12 27, 16 32, 20 32 C24 32, 28 27, 28 22 C28 16, 20 8, 20 8Z" fill="white" opacity="0.9"/>
          <path d="M20 12 C20 12, 15 17, 15 21 C15 26, 17 29, 20 29 C23 29, 25 26, 25 21 C25 17, 20 12, 20 12Z" fill="#ED1C24"/>
          <circle cx="20" cy="21" r="3" fill="white"/>
        </svg>

        <!-- ─── WING ─────────────────────────────────────── -->
        <svg v-else-if="bank.name === 'WING'" viewBox="0 0 40 40" class="w-6 h-6">
          <rect width="40" height="40" rx="8" fill="#00843D"/>
          <path d="M8 24 C8 24, 16 12, 20 12 C24 12, 32 24, 32 24 C32 24, 26 18, 20 18 C14 18, 8 24, 8 24Z" fill="white"/>
          <circle cx="20" cy="22" r="6" fill="#00843D"/>
          <text x="20" y="25" text-anchor="middle" fill="white" font-size="8" font-weight="bold" font-family="Arial, sans-serif">W</text>
        </svg>

        <!-- ─── BAKONG ───────────────────────────────────── -->
        <svg v-else-if="bank.name === 'Bakong'" viewBox="0 0 40 40" class="w-6 h-6">
          <rect width="40" height="40" rx="8" fill="#F7941E"/>
          <circle cx="20" cy="20" r="12" fill="none" stroke="white" stroke-width="2"/>
          <path d="M12 25 L20 14 L28 25Z" fill="white" opacity="0.9"/>
          <rect x="18" y="22" width="4" height="6" rx="1" fill="#F7941E"/>
          <line x1="14" y1="27" x2="26" y2="27" stroke="white" stroke-width="1.5"/>
        </svg>

        <!-- ─── SATHAPANA ────────────────────────────────── -->
        <svg v-else-if="bank.name === 'Sathapana'" viewBox="0 0 40 40" class="w-6 h-6">
          <rect width="40" height="40" rx="8" fill="#003878"/>
          <path d="M14 14 C14 14, 18 11, 22 14 C26 17, 14 23, 18 26 C22 29, 26 26, 26 26" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="20" cy="14" r="2" fill="white"/>
          <circle cx="20" cy="26" r="2" fill="white"/>
        </svg>
      </div>
      <span class="text-[10px] font-medium text-[#C4A8B6] group-hover:text-[#FF7AA2] transition-colors">
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
  { name: 'Sathapana', label: 'Sathapana' },
]
</script>
