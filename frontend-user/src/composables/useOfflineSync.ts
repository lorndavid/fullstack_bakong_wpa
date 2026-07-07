import { ref, readonly } from 'vue'
import api from '@/services/api'

interface SyncItem {
  id: string
  type: 'wishlist' | 'cart' | 'address' | 'settings' | 'profile' | 'notification_read'
  data: any
  timestamp: number
  synced: boolean
}

const SYNC_KEY = 'offline_sync_queue'

export function useOfflineSync() {
  const isSyncing = ref(false)
  const lastSyncedAt = ref<Date | null>(null)
  const pendingCount = ref(0)

  function getQueue(): SyncItem[] {
    try {
      return JSON.parse(localStorage.getItem(SYNC_KEY) || '[]')
    } catch {
      return []
    }
  }

  function saveQueue(queue: SyncItem[]) {
    localStorage.setItem(SYNC_KEY, JSON.stringify(queue))
    pendingCount.value = queue.filter((item) => !item.synced).length
  }

  function addToQueue(type: SyncItem['type'], data: any) {
    const queue = getQueue()
    queue.push({
      id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
    })
    saveQueue(queue)
  }

  function removeFromQueue(id: string) {
    const queue = getQueue().filter((item) => item.id !== id)
    saveQueue(queue)
  }

  function clearSynced() {
    const queue = getQueue().filter((item) => !item.synced)
    saveQueue(queue)
  }

  async function syncAll(): Promise<number> {
    const queue = getQueue().filter((item) => !item.synced)
    if (queue.length === 0) return 0

    isSyncing.value = true
    let syncedCount = 0

    for (const item of queue) {
      try {
        await syncItem(item)
        item.synced = true
        syncedCount++
      } catch {
        // Will retry on next sync
        break
      }
    }

    saveQueue(getQueue())
    lastSyncedAt.value = new Date()
    isSyncing.value = false
    return syncedCount
  }

  async function syncItem(item: SyncItem) {
    switch (item.type) {
      case 'wishlist':
        await api.post('/wishlist/sync', { items: item.data })
        break
      case 'cart':
        await api.post('/cart/sync', { items: item.data })
        break
      case 'address':
        await api.post('/addresses/sync', { addresses: item.data })
        break
      case 'settings':
        await api.put('/user/settings', item.data)
        break
      case 'profile':
        await api.put('/auth/profile', item.data)
        break
      case 'notification_read':
        await api.put(`/notifications/${item.data.id}/read`)
        break
    }
  }

  async function syncWhenOnline() {
    if (!navigator.onLine) return
    if (isSyncing.value) return

    const synced = await syncAll()
    if (synced > 0) {
      clearSynced()
    }
  }

  // Initialize queue count
  pendingCount.value = getQueue().filter((item) => !item.synced).length

  return {
    isSyncing: readonly(isSyncing),
    lastSyncedAt: readonly(lastSyncedAt),
    pendingCount: readonly(pendingCount),
    addToQueue,
    removeFromQueue,
    syncAll,
    syncWhenOnline,
  }
}
