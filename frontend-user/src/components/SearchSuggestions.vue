<template>
  <div class="space-y-6">
    <!-- Recent Searches -->
    <div v-if="recentSearches.length > 0">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-surface-600 dark:text-surface-300 flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ $t('search.recentSearches') }}
        </h3>
        <button
          @click="$emit('clearHistory')"
          class="text-xs text-surface-400 hover:text-red-500 transition-colors"
        >
          {{ $t('common.clear') }}
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="query in recentSearches"
          :key="query"
          @click="$emit('selectSearch', query)"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-600 rounded-full text-xs sm:text-sm text-surface-600 dark:text-surface-300 hover:border-primary-300 hover:text-primary-600 transition-all"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ query }}
        </button>
      </div>
    </div>

    <!-- Popular Searches -->
    <div>
      <h3 class="text-sm font-semibold text-surface-600 dark:text-surface-300 flex items-center gap-1.5 mb-3">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        {{ $t('search.popularSearches') }}
      </h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="query in popularSearches"
          :key="query"
          @click="$emit('selectSearch', query)"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-full text-xs sm:text-sm text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
          </svg>
          {{ query }}
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="recentSearches.length === 0 && popularSearches.length === 0" class="text-center py-8">
      <p class="text-sm text-surface-400">{{ $t('search.noSearches') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  recentSearches: string[]
  popularSearches: string[]
}>()

defineEmits<{
  selectSearch: [query: string]
  clearHistory: []
}>()
</script>
