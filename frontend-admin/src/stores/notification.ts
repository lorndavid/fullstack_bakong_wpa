import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io, Socket } from 'socket.io-client'
import api from '@/services/api'

export interface AdminNotification {
  _id: string
  user?: { _id: string; name: string; email: string }
  type: string
  title: string
  message: string
  data?: Record<string, any>
  link?: string
  read: boolean
  channels: string[]
  scheduledFor?: string
  sentAt?: string
  createdAt: string
  updatedAt: string
}

export interface NotificationStats {
  total: number
  unread: number
  sentToday: number
  scheduled: number
  byType: { type: string; count: number }[]
}

export const useNotificationStore = defineStore('adminNotification', () => {
  const notifications = ref<AdminNotification[]>([])
  const loading = ref(false)
  const stats = ref<NotificationStats | null>(null)
  const statsLoading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const pages = ref(1)
  const filterType = ref('')

  // ─── Fetch notifications ─────────────────────────────────────
  async function fetchNotifications(p = 1) {
    try {
      loading.value = true
      page.value = p
      const params: any = { page: p, limit: 20 }
      if (filterType.value) params.type = filterType.value
      const data: any = await api.get('/notifications/admin/all', { params })
      notifications.value = data.notifications || []
      total.value = data.pagination?.total || 0
      pages.value = data.pagination?.pages || 1
    } catch {
      // silent
    } finally {
      loading.value = false
    }
  }

  // ─── Fetch stats ─────────────────────────────────────────────
  async function fetchStats() {
    try {
      statsLoading.value = true
      const data: any = await api.get('/notifications/admin/stats')
      stats.value = data.stats
    } catch {
      // silent
    } finally {
      statsLoading.value = false
    }
  }

  // ─── Create notification ─────────────────────────────────────
  async function createNotification(payload: {
    type: string
    title: string
    message: string
    data?: Record<string, any>
    link?: string
    channels: string[]
    audience: 'all_users' | 'all_admins' | 'single_user'
    userId?: string
    scheduledFor?: string
    expiresAt?: string
  }): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const data: any = await api.post('/notifications/admin/create', payload)
      return { success: true, message: data.message, count: data.count }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to create notification' }
    }
  }

  // ─── Delete notification ─────────────────────────────────────
  async function deleteNotification(id: string) {
    try {
      await api.delete(`/notifications/admin/${id}`)
      notifications.value = notifications.value.filter((n) => n._id !== id)
      fetchStats()
    } catch {
      // silent
    }
  }

  return {
    notifications,
    loading,
    stats,
    statsLoading,
    total,
    page,
    pages,
    filterType,
    fetchNotifications,
    fetchStats,
    createNotification,
    deleteNotification,
  }
})
