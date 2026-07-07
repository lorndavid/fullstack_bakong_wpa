<template>
  <Transition name="update-banner">
    <div
      v-if="visible"
      class="fixed bottom-20 sm:bottom-4 left-4 right-4 z-[90] max-w-md mx-auto"
      role="alert"
      aria-live="assertive"
    >
      <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 p-4 backdrop-blur-xl bg-white/95 dark:bg-surface-800/95">
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold text-surface-800 dark:text-white">{{ $t('pwa.updateAvailable') }}</h4>
            <p class="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{{ $t('pwa.updateDescription') }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <button
              @click="$emit('update')"
              class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
            >
              {{ $t('pwa.updateNow') }}
            </button>
            <button
              @click="$emit('dismiss')"
              class="p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              :aria-label="$t('common.close')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

defineEmits<{
  update: []
  dismiss: []
}>()
</script>

<style scoped>
.update-banner-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.update-banner-leave-active {
  transition: all 0.2s ease-in;
}
.update-banner-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.update-banner-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
