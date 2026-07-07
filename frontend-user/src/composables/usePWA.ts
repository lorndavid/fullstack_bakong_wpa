import { ref, readonly } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  // ─── Install Prompt ────────────────────────────────────────
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
  const isInstallable = ref(false)
  const showInstallModal = ref(false)
  const isInstalled = ref(false)
  const installDismissed = ref(localStorage.getItem('pwa_install_dismissed') === 'true')

  function onBeforeInstall(event: Event) {
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
    isInstallable.value = true
    // Show modal automatically if not dismissed permanently
    if (!installDismissed.value) {
      showInstallModal.value = true
    }
  }

  async function installApp(): Promise<boolean> {
    if (!deferredPrompt.value) return false
    try {
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      if (outcome === 'accepted') {
        isInstalled.value = true
        showInstallModal.value = false
        return true
      }
    } catch {
      // Prompt failed
    } finally {
      deferredPrompt.value = null
      isInstallable.value = false
    }
    return false
  }

  function dismissInstall() {
    showInstallModal.value = false
  }

  function neverShowAgain() {
    showInstallModal.value = false
    installDismissed.value = true
    localStorage.setItem('pwa_install_dismissed', 'true')
  }

  function resetInstallDismissed() {
    installDismissed.value = false
    localStorage.removeItem('pwa_install_dismissed')
  }

  // ─── Auto Update ───────────────────────────────────────────
  const showUpdateBanner = ref(false)
  const updateRegistration = ref<ServiceWorkerRegistration | null>(null)
  const newVersionAvailable = ref(false)

  function onSWUpdate(registration: ServiceWorkerRegistration) {
    showUpdateBanner.value = true
    updateRegistration.value = registration
    newVersionAvailable.value = true
  }

  function applyUpdate() {
    if (updateRegistration.value?.waiting) {
      updateRegistration.value.waiting.postMessage({ type: 'SKIP_WAITING' })
      updateRegistration.value.waiting.addEventListener('statechange', (e) => {
        const sw = e.target as ServiceWorker
        if (sw.state === 'activated') {
          window.location.reload()
        }
      })
    }
  }

  function dismissUpdate() {
    showUpdateBanner.value = false
  }

  // ─── Service Worker Registration ───────────────────────────
  function register() {
    if (!('serviceWorker' in navigator)) return

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    // Listen for installation success
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      isInstallable.value = false
      showInstallModal.value = false
    })

    // Register the service worker
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              onSWUpdate(registration)
            }
          })
        }
      })

      // Listen for controllerchange (after update)
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return
        refreshing = true
        window.location.reload()
      })
    }).catch(() => {
      // SW registration failed - app works without it
    })

    // Detect standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      isInstalled.value = true
    }
  }

  return {
    isInstallable: readonly(isInstallable),
    showInstallModal: readonly(showInstallModal),
    isInstalled: readonly(isInstalled),
    installDismissed: readonly(installDismissed),
    showUpdateBanner: readonly(showUpdateBanner),
    newVersionAvailable: readonly(newVersionAvailable),
    installApp,
    dismissInstall,
    neverShowAgain,
    resetInstallDismissed,
    applyUpdate,
    dismissUpdate,
    register,
  }
}
