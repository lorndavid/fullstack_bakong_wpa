<template>
  <div class="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
    <!-- Illustration -->
    <div class="relative mb-8">
      <div class="w-36 h-36 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center">
        <svg class="w-20 h-20 text-surface-300 dark:text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414M14.828 9.172a4 4 0 010 5.657m-2.829-2.829a1 1 0 010-1.414M2.343 2.343l19.314 19.314" />
        </svg>
      </div>
      <!-- Floating signal icon -->
      <div class="absolute -top-2 -right-2 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-pulse-soft">
        <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M20 4H4l8 12L20 4z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- Text -->
    <h1 class="text-2xl font-bold text-surface-800 dark:text-white mb-2">{{ $t('offline.title') }}</h1>
    <p class="text-sm text-surface-500 dark:text-surface-400 max-w-md mb-2">{{ $t('offline.description') }}</p>
    <p class="text-xs text-surface-400 dark:text-surface-500 mb-8">{{ $t('offline.autoConnect') }}</p>

    <!-- Offline Capabilities -->
    <div class="w-full max-w-sm space-y-3 mb-8">
      <h3 class="text-sm font-semibold text-surface-600 dark:text-surface-300 mb-3">{{ $t('offline.youCan') }}</h3>
      <div
        v-for="cap in capabilities"
        :key="cap.key"
        class="flex items-center gap-3 p-3 bg-white dark:bg-surface-800 rounded-xl border border-surface-100 dark:border-surface-700"
      >
        <div class="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
          <span class="text-base">{{ cap.icon }}</span>
        </div>
        <span class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ cap.label }}</span>
      </div>
    </div>

    <!-- Retry Button -->
    <button
      @click="$emit('retry')"
      class="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary-500/25"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {{ $t('offline.retry') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineEmits<{
  retry: []
}>()

const capabilities = [
  { key: 'browse', icon: '🛍️', label: t('offline.browseProducts') },
  { key: 'wishlist', icon: '❤️', label: t('offline.viewWishlist') },
  { key: 'cart', icon: '🛒', label: t('offline.viewCart') },
  { key: 'orders', icon: '📋', label: t('offline.viewOrders') },
]
</script>
