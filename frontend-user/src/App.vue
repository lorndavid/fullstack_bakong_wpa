<template>
  <component :is="layout">
    <router-view />
  </component>

  <!-- ── PWA Install Modal ──────────────────────────────── -->
  <PWAInstallModal
    :visible="pwa.showInstallModal.value && !pwa.isInstalled.value"
    :installed="pwaIsInstalled"
    @install="handleInstall"
    @dismiss="pwa.dismissInstall()"
    @neverShow="pwa.neverShowAgain()"
    @open-app="handleOpenApp"
    @close="pwa.dismissInstall()"
  />

  <!-- ── Auto-Update Banner ─────────────────────────────── -->
  <AutoUpdateBanner
    :visible="pwa.showUpdateBanner.value"
    @update="pwa.applyUpdate()"
    @dismiss="pwa.dismissUpdate()"
  />

  <!-- ── Network Status Pill ────────────────────────────── -->
  <NetworkStatusPill
    :status="network.connectionStatus.value"
    :syncing="offlineSync.isSyncing.value"
    :show="network.showOfflineBanner.value"
  />

  <!-- ── Offline Full Page Overlay ──────────────────────── -->
  <Teleport to="body">
    <Transition name="offline-overlay">
      <div
        v-if="showOfflineOverlay"
        class="fixed inset-0 z-[70] bg-white dark:bg-surface-900 overflow-y-auto"
      >
        <button
          @click="goBack"
          class="absolute top-4 left-4 z-10 p-2 rounded-xl bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm shadow-lg"
          :aria-label="$t('common.goBack')"
        >
          <svg class="w-5 h-5 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <OfflinePage @retry="handleRetry" />
      </div>
    </Transition>
  </Teleport>

  <!-- ── Toast Container ────────────────────────────────── -->
  <div class="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full pointer-events-none">
    <TransitionGroup name="toast">
      <div v-for="toast in toastList" :key="toast.id"
        class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm animate-slide-up"
        :class="toastClasses(toast.type)">
        <span v-if="toast.type === 'success'" class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        </span>
        <span v-else-if="toast.type === 'error'" class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        </span>
        <span class="text-white text-sm font-medium flex-1">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-white/70 hover:text-white transition-colors">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import api from '@/services/api'
import { mergeTextOverrides } from '@/i18n'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useToast, type Toast } from '@/composables/useToast'
import { usePWA } from '@/composables/usePWA'
import { useNetworkStatus } from '@/composables/useNetworkStatus'
import { useOfflineSync } from '@/composables/useOfflineSync'
import { useConfetti } from '@/composables/useConfetti'

import PWAInstallModal from '@/components/PWAInstallModal.vue'
import AutoUpdateBanner from '@/components/AutoUpdateBanner.vue'
import NetworkStatusPill from '@/components/NetworkStatusPill.vue'
import OfflinePage from '@/components/OfflinePage.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const siteLogo = ref('')

// Provide logo URL for layouts to consume
provide('siteLogo', siteLogo)

// ─── Layout ──────────────────────────────────────────────────
const layoutMap: Record<string, any> = {
  default: DefaultLayout,
  auth: AuthLayout,
}

const layout = computed(() => {
  const layoutName = (route.meta.layout as string) || 'default'
  return layoutMap[layoutName] || DefaultLayout
})

// ─── PWA ─────────────────────────────────────────────────────
const pwa = usePWA()
const pwaIsInstalled = ref(false)

async function handleInstall() {
  const installed = await pwa.installApp()
  if (installed) {
    pwaIsInstalled.value = true
    fireConfetti()
  }
}

function handleOpenApp() {
  pwaIsInstalled.value = false
  pwa.dismissInstall()
}

// Fire confetti on successful install
const { fireConfetti } = useConfetti()

// ─── Network Status ──────────────────────────────────────────
const network = useNetworkStatus()
const offlineSync = useOfflineSync()
const showOfflineOverlay = ref(false)

// Show offline overlay when offline and not on auth pages
watch(() => network.isOnline.value, (online) => {
  if (!online && route.meta.layout !== 'auth') {
    // Wait a bit to avoid flash on page load
    setTimeout(() => {
      if (!network.isOnline.value) {
        showOfflineOverlay.value = true
      }
    }, 100)
  } else {
    showOfflineOverlay.value = false
    // Trigger sync when back online
    offlineSync.syncWhenOnline()
  }
})

function handleRetry() {
  if (navigator.onLine) {
    showOfflineOverlay.value = false
    window.location.reload()
  }
}

function goBack() {
  router.back()
}

// ─── Toast System ────────────────────────────────────────────
const { toasts: toastList, remove: removeToast } = useToast()
provide('toast', useToast())

function toastClasses(type: Toast['type']) {
  return {
    success: 'bg-accent-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-primary-500',
  }[type]
}

// ─── Settings & Theme ────────────────────────────────────────
async function loadSettings() {
  try {
    const data: any = await api.get('/settings')
    const s = data.settings
    if (!s) return

    if (s.colors) {
      const root = document.documentElement
      if (s.colors.primary) {
        root.style.setProperty('--color-primary', s.colors.primary)
        root.style.setProperty('--color-primary-500', s.colors.primary)
      }
      if (s.colors.accent) {
        root.style.setProperty('--color-accent', s.colors.accent)
        root.style.setProperty('--color-accent-500', s.colors.accent)
      }
    }

    if (s.logo?.secure_url) {
      siteLogo.value = s.logo.secure_url
    }

    if (s.textOverrides && Object.keys(s.textOverrides).length > 0) {
      mergeTextOverrides(s.textOverrides)
    }
  } catch {
    // Silent
  }
}

// ─── Notifications ───────────────────────────────────────────
const authStore = useAuthStore()
const notifications = useNotificationStore()

onMounted(() => {
  // Initialize theme
  useThemeStore().init()

  // Load custom settings from admin
  loadSettings()

  // Register PWA service worker
  pwa.register()

  // Connect notifications
  if (authStore.isAuthenticated) {
    notifications.connect()
    notifications.fetchUnreadCount()
    notifications.initBrowserNotifications()
  }
})

watch(() => authStore.isAuthenticated, (val) => {
  if (val) {
    notifications.connect()
    notifications.fetchUnreadCount()
    notifications.initBrowserNotifications()
  } else {
    notifications.disconnect()
  }
})
</script>
