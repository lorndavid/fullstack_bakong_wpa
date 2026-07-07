<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-6 h-6 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="notifications.length === 0" class="text-center py-12">
      <div class="w-16 h-16 mx-auto mb-3 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-surface-300 dark:text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <p class="text-sm text-surface-400">{{ $t('notifications.noNotifications') }}</p>
    </div>

    <!-- Grouped Notifications -->
    <div v-else class="space-y-6">
      <div v-for="(group, groupName) in grouped" :key="groupName">
        <h3 class="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 px-1">{{ groupName }}</h3>
        <div class="space-y-1.5">
          <div
            v-for="notif in group"
            :key="notif._id"
            class="bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700 overflow-hidden hover:shadow-card-hover transition-all duration-200 cursor-pointer"
            :class="{ 'border-l-4 border-l-primary-500': !notif.read }"
            @click="handleClick(notif)"
          >
            <div class="p-4 flex items-start gap-3">
              <!-- Icon -->
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                :class="iconBgClass(notif.type)"
              >
                <svg class="w-5 h-5" :class="iconColorClass(notif.type)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="notif.type === 'order_confirmed'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  <path v-else-if="notif.type === 'payment_successful'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path v-else-if="notif.type === 'shipping_update'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  <path v-else-if="notif.type === 'flash_sale'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  <path v-else-if="notif.type === 'new_coupon'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  <path v-else-if="notif.type === 'wishlist_price_drop'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h4 class="text-sm font-medium" :class="!notif.read ? 'font-bold text-surface-800 dark:text-white' : 'text-surface-600 dark:text-surface-300'">
                      {{ notif.title }}
                    </h4>
                    <p class="text-xs text-surface-400 mt-0.5">{{ getRelativeTime(notif.createdAt) }}</p>
                  </div>
                  <div class="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      v-if="!notif.read"
                      @click.stop="markAsRead(notif._id)"
                      class="p-1.5 text-surface-400 hover:text-primary-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                      :title="$t('notifications.markRead')"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      @click.stop="deleteNotif(notif._id)"
                      class="p-1.5 text-surface-400 hover:text-red-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                      :title="$t('common.delete')"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p class="text-sm text-surface-600 dark:text-surface-300 mt-1">{{ notif.message }}</p>
                <div v-if="notif.link" class="mt-1.5">
                  <span class="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">
                    {{ $t('notifications.viewDetails') }} →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface NotificationItem {
  _id: string
  type: string
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

const props = defineProps<{
  notifications: NotificationItem[]
  loading: boolean
}>()

const emit = defineEmits<{
  markRead: [id: string]
  markAllRead: []
  delete: [id: string]
  click: [notif: NotificationItem]
}>()

const router = useRouter()

function iconColorClass(type: string): string {
  const classes: Record<string, string> = {
    order_confirmed: 'text-blue-500',
    payment_successful: 'text-green-500',
    shipping_update: 'text-amber-500',
    flash_sale: 'text-purple-500',
    new_coupon: 'text-rose-500',
    wishlist_price_drop: 'text-teal-500',
    admin_broadcast: 'text-primary-500',
  }
  return classes[type] || 'text-surface-500'
}

function iconBgClass(type: string): string {
  const classes: Record<string, string> = {
    order_confirmed: 'bg-blue-100 dark:bg-blue-900/20',
    payment_successful: 'bg-green-100 dark:bg-green-900/20',
    shipping_update: 'bg-amber-100 dark:bg-amber-900/20',
    flash_sale: 'bg-purple-100 dark:bg-purple-900/20',
    new_coupon: 'bg-rose-100 dark:bg-rose-900/20',
    wishlist_price_drop: 'bg-teal-100 dark:bg-teal-900/20',
    admin_broadcast: 'bg-primary-100 dark:bg-primary-900/20',
  }
  return classes[type] || 'bg-surface-100 dark:bg-surface-700'
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

function isToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  return date.toDateString() === now.toDateString()
}

function isYesterday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  return date >= weekStart
}

function isThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

const grouped = computed(() => {
  const groups: Record<string, NotificationItem[]> = {}

  for (const notif of props.notifications) {
    let groupName: string
    if (isToday(notif.createdAt)) {
      groupName = 'Today'
    } else if (isYesterday(notif.createdAt)) {
      groupName = 'Yesterday'
    } else if (isThisWeek(notif.createdAt)) {
      groupName = 'This Week'
    } else if (isThisMonth(notif.createdAt)) {
      groupName = 'This Month'
    } else {
      groupName = 'Earlier'
    }

    if (!groups[groupName]) {
      groups[groupName] = []
    }
    groups[groupName].push(notif)
  }

  return groups
})

function handleClick(notif: NotificationItem) {
  if (!notif.read) {
    emit('markRead', notif._id)
  }
  if (notif.link) {
    router.push(notif.link)
  }
  emit('click', notif)
}

function markAsRead(id: string) {
  emit('markRead', id)
}

function deleteNotif(id: string) {
  emit('delete', id)
}
</script>
