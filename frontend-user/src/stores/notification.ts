import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import api from '@/services/api'

export interface NotificationItem {
  _id: string
  user?: string
  type: 'order_confirmed' | 'payment_successful' | 'shipping_update' | 'flash_sale' | 'new_coupon' | 'wishlist_price_drop' | 'admin_broadcast'
  title: string
  message: string
  data?: Record<string, any>
  link?: string
  read: boolean
  readAt?: string
  channels: string[]
  scheduledFor?: string
  sentAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<NotificationItem[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const showPanel = ref(false)
  const socketConnected = ref(false)

  const hasUnread = computed(() => unreadCount.value > 0)

  // ─── Socket Connection ────────────────────────────────────────
  let socket: Socket | null = null

  function connect() {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    if (socket?.connected) return

    socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      socketConnected.value = true
    })

    socket.on('disconnect', () => {
      socketConnected.value = false
    })

    socket.on('connect_error', () => {
      socketConnected.value = false
    })

    // Listen for new notifications
    socket.on('notification:new', (notification: NotificationItem) => {
      notifications.value.unshift(notification)
      unreadCount.value++
      // Trigger browser notification if permitted (only when 'push' channel is included)
      if (notification.channels?.includes('push') || !notification.channels) {
        showBrowserNotification(notification.title, notification.message, notification.link)
      }
    })

    // Listen for mark-read updates
    socket.on('notification:updated', (data: { notificationId: string; read: boolean }) => {
      const idx = notifications.value.findIndex((n) => n._id === data.notificationId)
      if (idx >= 0) {
        notifications.value[idx].read = data.read
      }
    })

    // Listen for all-read
    socket.on('notification:all-read', () => {
      notifications.value.forEach((n) => (n.read = true))
      unreadCount.value = 0
    })
  }

  function disconnect() {
    if (socket) {
      socket.disconnect()
      socket = null
    }
    socketConnected.value = false
  }

  // ─── Mark as read via socket ─────────────────────────────────
  function markAsReadViaSocket(notificationId: string) {
    if (socket?.connected) {
      socket.emit('notification:mark-read', notificationId)
    } else {
      // Fallback to REST
      markAsRead(notificationId)
    }
  }

  function markAllAsReadViaSocket() {
    if (socket?.connected) {
      socket.emit('notification:mark-all-read')
    } else {
      markAllAsRead()
    }
  }

  // ─── API Methods ─────────────────────────────────────────────
  async function fetchNotifications(page = 1, limit = 20) {
    try {
      loading.value = true
      const data: any = await api.get('/notifications', { params: { page, limit } })
      if (page === 1) {
        notifications.value = data.notifications || []
      } else {
        notifications.value.push(...(data.notifications || []))
      }
      unreadCount.value = data.unreadCount || 0
      return data.pagination
    } catch {
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    try {
      const data: any = await api.get('/notifications/unread-count')
      unreadCount.value = data.unreadCount || 0
    } catch {
      // silent
    }
  }

  async function markAsRead(id: string) {
    try {
      await api.put(`/notifications/${id}/read`)
      const idx = notifications.value.findIndex((n) => n._id === id)
      if (idx >= 0) {
        notifications.value[idx].read = true
      }
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch {
      // silent
    }
  }

  async function markAllAsRead() {
    try {
      await api.put('/notifications/read-all')
      notifications.value.forEach((n) => (n.read = true))
      unreadCount.value = 0
    } catch {
      // silent
    }
  }

  async function deleteNotification(id: string) {
    try {
      await api.delete(`/notifications/${id}`)
      notifications.value = notifications.value.filter((n) => n._id !== id)
      if (!notifications.value.find((n) => !n.read)) {
        // Recalculate unread
        unreadCount.value = notifications.value.filter((n) => !n.read).length
      }
    } catch {
      // silent
    }
  }

  // ─── Panel Toggle ────────────────────────────────────────────
  function togglePanel() {
    showPanel.value = !showPanel.value
    if (showPanel.value) {
      fetchNotifications()
    }
  }

  function openPanel() {
    showPanel.value = true
    fetchNotifications()
  }

  function closePanel() {
    showPanel.value = false
  }

  // ─── Icon & label helpers ────────────────────────────────────
  function getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      order_confirmed: '📋',
      payment_successful: '💳',
      shipping_update: '🚚',
      flash_sale: '⚡',
      new_coupon: '🎉',
      wishlist_price_drop: '💰',
      admin_broadcast: '📢',
    }
    return icons[type] || '🔔'
  }

  function getRelativeTime(dateStr: string): string {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // ─── Browser Notification API ──────────────────────────────
  function requestBrowserPermission() {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    Notification.requestPermission()
    return false
  }

  function showBrowserNotification(title: string, message: string, link?: string) {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    try {
      const notif = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: 'shop-notification',
      })
      notif.onclick = () => {
        window.focus()
        if (link) {
          window.location.href = link
        }
        notif.close()
      }
    } catch {
      // Browser notification not supported or blocked
    }
  }

  // Exposed for requesting browser notification permission from layout
  function initBrowserNotifications() {
    requestBrowserPermission()
  }

  return {
    notifications,
    unreadCount,
    loading,
    showPanel,
    socketConnected,
    hasUnread,
    connect,
    disconnect,
    initBrowserNotifications,
    markAsReadViaSocket,
    markAllAsReadViaSocket,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    togglePanel,
    openPanel,
    closePanel,
    getNotificationIcon,
    getRelativeTime,
  }
})
