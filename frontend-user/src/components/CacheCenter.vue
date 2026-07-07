<template>
  <div class="space-y-4">
    <!-- Storage Info -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card space-y-4">
      <h3 class="text-base font-semibold text-surface-800 dark:text-white flex items-center gap-2">
        <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
        {{ $t('cache.storageUsage') }}
      </h3>

      <div class="space-y-3">
        <div v-for="cache in caches" :key="cache.name" class="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-base" :class="cache.bgClass">
              {{ cache.icon }}
            </div>
            <div>
              <p class="text-sm font-medium text-surface-800 dark:text-white">{{ cache.label }}</p>
              <p class="text-xs text-surface-400">{{ cache.size }}</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-primary-700 dark:text-primary-300">{{ $t('cache.totalCache') }}</p>
              <p class="text-xs text-primary-500">{{ totalSize }}</p>
            </div>
          </div>
          <button
            @click="clearAllCaches"
            :disabled="clearing"
            class="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
          >
            {{ clearing ? $t('common.loading') : $t('cache.clearAll') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card space-y-3">
      <h3 class="text-base font-semibold text-surface-800 dark:text-white">{{ $t('cache.actions') }}</h3>
      <button
        @click="refreshCache"
        :disabled="refreshing"
        class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <span class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ $t('cache.refreshCache') }}</span>
        </div>
        <svg v-if="!refreshing" class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <div v-else class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </button>

      <button
        @click="downloadOfflineContent"
        :disabled="downloading"
        class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <span class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ $t('cache.downloadOffline') }}</span>
        </div>
        <div v-if="!downloading" class="flex items-center gap-2">
          <span class="text-xs text-surface-400">{{ downloadProgress }}%</span>
          <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div v-else class="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const toast = useToast()

const clearing = ref(false)
const refreshing = ref(false)
const downloading = ref(false)
const downloadProgress = ref(0)
const totalSize = ref('Calculating...')

interface CacheInfo {
  name: string
  label: string
  icon: string
  bgClass: string
  size: string
}

const caches = ref<CacheInfo[]>([
  { name: 'app-shell', label: t('cache.appShell'), icon: '📦', bgClass: 'bg-blue-100 dark:bg-blue-900/20', size: '—' },
  { name: 'product-images', label: t('cache.images'), icon: '🖼️', bgClass: 'bg-purple-100 dark:bg-purple-900/20', size: '—' },
  { name: 'categories', label: t('cache.categories'), icon: '📂', bgClass: 'bg-amber-100 dark:bg-amber-900/20', size: '—' },
  { name: 'products', label: t('cache.products'), icon: '🛍️', bgClass: 'bg-green-100 dark:bg-green-900/20', size: '—' },
])

async function calculateCacheSize() {
  if (!('caches' in window)) return
  let total = 0
  for (const cache of caches.value) {
    try {
      const c = await window.caches.open(cache.name)
      const keys = await c.keys()
      const size = keys.length * 5000 // rough estimate
      total += size
      cache.size = formatSize(size)
    } catch {
      cache.size = '0 KB'
    }
  }
  totalSize.value = formatSize(total)
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function clearAllCaches() {
  clearing.value = true
  try {
    if ('caches' in window) {
      for (const cache of caches.value) {
        try {
          const c = await window.caches.open(cache.name)
          const keys = await c.keys()
          await Promise.all(keys.map((r) => c.delete(r)))
          cache.size = '0 KB'
        } catch {}
      }
    }
    totalSize.value = '0 B'
    toast.success(t('cache.cleared'))
  } catch {
    toast.error(t('cache.clearError'))
  } finally {
    clearing.value = false
  }
}

async function refreshCache() {
  refreshing.value = true
  try {
    if ('caches' in window) {
      await window.caches.delete('app-shell')
      await window.caches.delete('categories')
      await window.caches.delete('products')
      toast.success(t('cache.refreshed'))
    }
  } catch {
    toast.error(t('cache.refreshError'))
  } finally {
    refreshing.value = false
  }
}

async function downloadOfflineContent() {
  downloading.value = true
  downloadProgress.value = 0
  try {
    // Simulate downloading featured products for offline
    for (let i = 0; i <= 100; i += 10) {
      downloadProgress.value = i
      await new Promise((r) => setTimeout(r, 200))
    }
    toast.success(t('cache.downloadComplete'))
  } catch {
    toast.error(t('cache.downloadError'))
  } finally {
    downloading.value = false
    downloadProgress.value = 100
  }
}

onMounted(() => {
  calculateCacheSize()
})
</script>
