<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
    <!-- Error type illustration -->
    <div class="relative mb-6">
      <div
        class="w-32 h-32 rounded-full flex items-center justify-center"
        :class="{
          'bg-amber-100 dark:bg-amber-900/20': type === '404',
          'bg-red-100 dark:bg-red-900/20': type === '500',
          'bg-blue-100 dark:bg-blue-900/20': type === 'maintenance',
          'bg-surface-100 dark:bg-surface-700': type === 'update',
        }"
      >
        <!-- 404: Search icon -->
        <svg v-if="type === '404'" class="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <!-- 500: Warning icon -->
        <svg v-else-if="type === '500'" class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <!-- Maintenance: Tools icon -->
        <svg v-else-if="type === 'maintenance'" class="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <!-- Update: Arrow down icon -->
        <svg v-else class="w-16 h-16 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </div>
    </div>

    <!-- Title -->
    <h1 class="text-2xl font-bold text-surface-800 dark:text-white mb-2">{{ title }}</h1>
    <p class="text-sm text-surface-500 dark:text-surface-400 max-w-md mb-6">{{ description }}</p>

    <!-- Action -->
    <div class="flex items-center gap-3">
      <button
        v-if="showHome"
        @click="goHome"
        class="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary-500/25"
      >
        {{ $t('common.goHome') }}
      </button>
      <button
        v-if="showRetry"
        @click="$emit('retry')"
        class="px-5 py-2.5 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200 font-semibold rounded-xl transition-all"
      >
        {{ $t('common.retry') }}
      </button>
      <button
        v-if="showUpdate"
        @click="$emit('update')"
        class="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
      >
        {{ $t('pwa.updateNow') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const props = defineProps<{
  type: '404' | '500' | 'maintenance' | 'update'
}>()

defineEmits<{
  retry: []
  update: []
}>()

const title = computed(() => {
  return {
    '404': t('error.notFound'),
    '500': t('error.serverError'),
    'maintenance': t('error.maintenance'),
    'update': t('error.updateRequired'),
  }[props.type]
})

const description = computed(() => {
  return {
    '404': t('error.notFoundDesc'),
    '500': t('error.serverErrorDesc'),
    'maintenance': t('error.maintenanceDesc'),
    'update': t('error.updateRequiredDesc'),
  }[props.type]
})

const showHome = computed(() => props.type === '404' || props.type === '500')
const showRetry = computed(() => props.type === '500')
const showUpdate = computed(() => props.type === 'update')

function goHome() {
  router.push('/')
}
</script>
