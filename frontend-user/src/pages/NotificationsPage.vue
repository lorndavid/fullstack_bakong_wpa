<template>
  <div class="max-w-3xl mx-auto px-4 py-6 sm:py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('notifications.title') }}</h1>
          <p v-if="store.unreadCount > 0" class="text-xs text-surface-400">{{ store.unreadCount }} {{ $t('notifications.unread') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="store.unreadCount > 0"
          @click="store.markAllAsRead()"
          class="px-3 py-2 text-xs font-medium text-primary-500 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
        >
          {{ $t('notifications.markAllRead') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && store.notifications.length === 0" class="text-center py-16">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
      <p class="text-sm text-surface-400 mt-3">{{ $t('common.loading') }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="store.notifications.length === 0" class="text-center py-16">
      <div class="w-20 h-20 mx-auto mb-4 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center">
        <svg class="w-10 h-10 text-surface-300 dark:text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-600 dark:text-surface-300">{{ $t('notifications.noNotifications') }}</h3>
      <p class="text-sm text-surface-400 mt-1">{{ $t('notifications.noNotificationsDesc') }}</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-2">
      <div
        v-for="notif in store.notifications"
        :key="notif._id"
        class="bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700 overflow-hidden hover:shadow-card-hover transition-all duration-200 cursor-pointer"
        :class="{ 'border-l-4 border-l-primary-500': !notif.read }"
        @click="handleClick(notif)"
      >
        <div class="p-4 flex items-start gap-4">
          <!-- Icon -->
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            :class="iconBgClass(notif.type)">
            {{ iconMap[notif.type] || '🔔' }}
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h4 class="text-sm font-semibold text-surface-800 dark:text-white" :class="{ 'font-bold': !notif.read }">
                  {{ notif.title }}
                </h4>
                <p class="text-xs text-surface-400 mt-0.5">{{ store.getRelativeTime(notif.createdAt) }}</p>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0">
                <button
                  v-if="!notif.read"
                  @click.stop="store.markAsRead(notif._id)"
                  class="p-1.5 text-surface-400 hover:text-primary-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  :title="$t('notifications.markRead')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </button>
                <button
                  @click.stop="store.deleteNotification(notif._id)"
                  class="p-1.5 text-surface-400 hover:text-red-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  :title="$t('common.delete')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <p class="text-sm text-surface-600 dark:text-surface-300 mt-1.5">{{ notif.message }}</p>
            <div v-if="notif.link" class="mt-2">
              <span class="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">
                {{ $t('notifications.viewDetails') }} →
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div v-if="hasMore" class="text-center pt-4">
        <button
          @click="loadMore"
          :disabled="store.loading"
          class="px-6 py-2.5 text-sm font-medium text-primary-500 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-600 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 disabled:opacity-50 transition-all"
        >
          {{ store.loading ? $t('common.loading') : $t('notifications.loadMore') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'

const store = useNotificationStore()
const router = useRouter()

const currentPage = ref(1)
const hasMore = ref(false)
const pagination = ref<any>(null)

const iconMap: Record<string, string> = {
  order_confirmed: '📋',
  payment_successful: '💳',
  shipping_update: '🚚',
  flash_sale: '⚡',
  new_coupon: '🎉',
  wishlist_price_drop: '💰',
  admin_broadcast: '📢',
}

onMounted(async () => {
  pagination.value = await store.fetchNotifications(1, 20)
  if (pagination.value) {
    hasMore.value = pagination.value.page < pagination.value.pages
  }
})

async function loadMore() {
  currentPage.value++
  const result = await store.fetchNotifications(currentPage.value, 20)
  if (result) {
    hasMore.value = result.page < result.pages
  }
}

function handleClick(notif: any) {
  if (!notif.read) {
    store.markAsRead(notif._id)
  }
  if (notif.link) {
    router.push(notif.link)
  }
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
</script>
