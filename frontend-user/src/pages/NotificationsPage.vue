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

    <!-- Loading Skeleton -->
    <div v-if="loading && store.notifications.length === 0" class="space-y-3">
      <div v-for="i in 5" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card animate-pulse">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 skeleton rounded-xl"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 skeleton rounded w-3/4"></div>
            <div class="h-3 skeleton rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Center -->
    <NotificationCenter
      v-else
      :notifications="store.notifications"
      :loading="store.loading"
      @mark-read="store.markAsRead($event)"
      @delete="store.deleteNotification($event)"
      @click="handleNotifClick"
    />

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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import NotificationCenter from '@/components/NotificationCenter.vue'

const store = useNotificationStore()
const router = useRouter()

const loading = ref(true)
const currentPage = ref(1)
const hasMore = ref(false)

onMounted(async () => {
  loading.value = true
  const pagination: any = await store.fetchNotifications(1, 20)
  if (pagination) {
    hasMore.value = pagination.page < pagination.pages
  }
  loading.value = false
})

async function loadMore() {
  currentPage.value++
  const pagination: any = await store.fetchNotifications(currentPage.value, 20)
  if (pagination) {
    hasMore.value = pagination.page < pagination.pages
  }
}

function handleNotifClick(notif: any) {
  if (notif.link) {
    router.push(notif.link)
  }
}
</script>

<style scoped>
.skeleton {
  @apply bg-surface-200 dark:bg-surface-700;
}
</style>
