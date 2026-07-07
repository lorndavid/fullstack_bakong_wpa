<template>
  <Teleport to="body">
    <!-- Install Modal -->
    <Transition name="install-modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('pwa.installTitle')"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="$emit('dismiss')"
        ></div>

        <!-- Modal Content -->
        <div
          v-if="!installed"
          class="relative w-full sm:max-w-md bg-white dark:bg-surface-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
        >
          <!-- Illustration Area -->
          <div class="relative bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 p-8 sm:p-10 text-center overflow-hidden">
            <!-- Decorative circles -->
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
            <div class="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full"></div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full"></div>

            <!-- Phone/Device Illustration -->
            <div class="relative z-10 mx-auto w-24 h-24 mb-4">
              <div class="w-full h-full bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/30">
                <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <h2 class="text-2xl font-bold text-white relative z-10">{{ $t('pwa.installTitle') }}</h2>
            <p class="text-white/80 text-sm mt-2 relative z-10">{{ $t('pwa.installSubtitle') }}</p>
          </div>

          <!-- Benefits List -->
          <div class="p-6 space-y-3">
            <div
              v-for="benefit in benefits"
              :key="benefit.key"
              class="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50"
            >
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="benefit.bgClass">
                <svg class="w-5 h-5" :class="benefit.iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="benefit.key === 'speed'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  <path v-else-if="benefit.key === 'offline'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  <path v-else-if="benefit.key === 'notifications'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-surface-800 dark:text-white">{{ benefit.title }}</p>
                <p class="text-xs text-surface-500 dark:text-surface-400">{{ benefit.description }}</p>
              </div>
            </div>

            <!-- Size estimate -->
            <div class="flex items-center justify-center gap-1.5 text-xs text-surface-400 pt-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span>{{ $t('pwa.estimatedSize') }} ~1.2 MB</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-6 pb-6 space-y-2.5">
            <button
              @click="handleInstall"
              class="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary-500/25"
            >
              <span class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {{ $t('pwa.installNow') }}
              </span>
            </button>
            <div class="flex items-center gap-2.5">
              <button
                @click="$emit('dismiss')"
                class="flex-1 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-colors"
              >
                {{ $t('pwa.maybeLater') }}
              </button>
              <button
                @click="$emit('neverShow')"
                class="flex-1 py-2.5 text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-colors"
              >
                {{ $t('pwa.neverShow') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Success State -->
        <div
          v-else
          class="relative w-full sm:max-w-sm bg-white dark:bg-surface-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-scale-in text-center"
        >
          <div class="p-10">
            <!-- Success checkmark animation -->
            <div class="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center mb-5 animate-bounce-in shadow-xl shadow-primary-500/30">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 class="text-xl font-bold text-surface-800 dark:text-white mb-2">{{ $t('pwa.installSuccess') }}</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400 mb-6">{{ $t('pwa.installSuccessDesc') }}</p>

            <button
              @click="$emit('openApp')"
              class="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary-500/25"
            >
              {{ $t('pwa.openApp') }}
            </button>
            <button
              @click="$emit('close')"
              class="mt-3 text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            >
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  visible: boolean
  installed: boolean
}>()

const emit = defineEmits<{
  install: []
  dismiss: []
  neverShow: []
  openApp: []
  close: []
}>()

const benefits = [    {
    key: 'speed',
    iconClass: 'text-yellow-500',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
    title: t('pwa.benefitSpeed'),
    description: t('pwa.benefitSpeedDesc'),
  },
  {
    key: 'offline',
    iconClass: 'text-blue-500',
    bgClass: 'bg-blue-100 dark:bg-blue-900/20',
    title: t('pwa.benefitOffline'),
    description: t('pwa.benefitOfflineDesc'),
  },
  {
    key: 'notifications',
    iconClass: 'text-purple-500',
    bgClass: 'bg-purple-100 dark:bg-purple-900/20',
    title: t('pwa.benefitNotifications'),
    description: t('pwa.benefitNotificationsDesc'),
  },
  {
    key: 'experience',
    iconClass: 'text-primary-500',
    bgClass: 'bg-primary-100 dark:bg-primary-900/20',
    title: t('pwa.benefitExperience'),
    description: t('pwa.benefitExperienceDesc'),
  },
]

function handleInstall() {
  emit('install')
}
</script>

<style scoped>
.install-modal-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.install-modal-leave-active {
  transition: all 0.2s ease-in;
}
.install-modal-enter-from {
  opacity: 0;
}
.install-modal-enter-from > div:first-child {
  transform: translateY(100%);
}
@media (min-width: 640px) {
  .install-modal-enter-from > div:first-child {
    transform: translateY(20px) scale(0.95);
  }
}
.install-modal-leave-to {
  opacity: 0;
}
.install-modal-leave-to > div:first-child {
  transform: translateY(100%);
}
@media (min-width: 640px) {
  .install-modal-leave-to > div:first-child {
    transform: translateY(20px) scale(0.95);
  }
}
.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
</style>
