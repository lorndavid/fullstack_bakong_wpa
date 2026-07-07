import { ref, readonly, onMounted, onUnmounted } from 'vue'

export type ConnectionStatus = 'online' | 'offline' | 'slow'

export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)
  const wasOffline = ref(false)
  const connectionStatus = ref<ConnectionStatus>(navigator.onLine ? 'online' : 'offline')
  const showOfflineBanner = ref(false)

  // Detect slow connections via Network Information API
  const isSlowConnection = ref(false)

  let connection: any = null

  function goOnline() {
    isOnline.value = true
    connectionStatus.value = 'online'
    if (wasOffline.value) {
      // Briefly show "back online" and then hide
      wasOffline.value = false
      showOfflineBanner.value = false
    }
  }

  function goOffline() {
    isOnline.value = false
    wasOffline.value = true
    connectionStatus.value = 'offline'
    showOfflineBanner.value = true
  }

  function handleOnline() {
    goOnline()
  }

  function handleOffline() {
    goOffline()
  }

  function handleConnectionChange() {
    if (connection) {
      isSlowConnection.value = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
      if (isSlowConnection.value) {
        connectionStatus.value = 'slow'
      }
    }
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Network Information API
    if ('connection' in navigator) {
      connection = (navigator as any).connection
      if (connection) {
        connection.addEventListener('change', handleConnectionChange)
        handleConnectionChange()
      }
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    if (connection) {
      connection.removeEventListener('change', handleConnectionChange)
    }
  })

  return {
    isOnline: readonly(isOnline),
    wasOffline: readonly(wasOffline),
    connectionStatus: readonly(connectionStatus),
    isSlowConnection: readonly(isSlowConnection),
    showOfflineBanner: readonly(showOfflineBanner),
    goOnline,
    goOffline,
  }
}
