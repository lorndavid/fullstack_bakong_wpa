<template>
  <Transition name="network-pill">
    <div
      v-if="show"
      class="fixed top-16 left-1/2 -translate-x-1/2 z-[80]"
      role="status"
      aria-live="polite"
    >
      <div
        class="flex items-center gap-2 px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md text-xs font-semibold transition-all duration-300"
        :class="statusClasses"
      >
        <!-- Icon -->
        <span v-if="status === 'online' && !syncing">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </span>
        <span v-else-if="status === 'offline'">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414" />
          </svg>
        </span>
        <span v-else-if="syncing">
          <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
        <span v-else-if="downloading">
          <svg class="w-3.5 h-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </span>

        <!-- Text -->
        <span>{{ label }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  status: 'online' | 'offline' | 'slow'
  syncing?: boolean
  downloading?: boolean
  show: boolean
}>()

const statusClasses = computed(() => {
  return {
    online: 'bg-green-500/90 text-white',
    offline: 'bg-red-500/90 text-white',
    slow: 'bg-amber-500/90 text-white',
  }[props.status]
})

const label = computed(() => {
  if (props.syncing) return t('network.syncing')
  if (props.downloading) return t('network.downloading')
  return t(`network.${props.status}`)
})
</script>

<style scoped>
.network-pill-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.network-pill-leave-active {
  transition: all 0.2s ease-in;
}
.network-pill-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
.network-pill-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
</style>
