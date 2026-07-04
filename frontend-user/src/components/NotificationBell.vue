<template>
  <div class="relative" ref="bellRef">
    <!-- Bell Button -->
    <button
      @click="togglePanel"
      class="relative p-2 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"
      :aria-label="$t('notifications.title')"
    >
      <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <!-- Badge -->
      <span
        v-if="store.hasUnread"
        class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg animate-scale-in"
      >
        {{ store.unreadCount > 99 ? '99+' : store.unreadCount }}
      </span>
    </button>

    <!-- Notification Panel -->
    <Transition name="notif-panel">
      <div
        v-if="store.showPanel"
        class="absolute right-0 top-full mt-2 w-[380px] sm:w-[420px] bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 overflow-hidden z-50"
      >
        <!-- Header -->
        <div class="px-5 py-3.5 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between bg-surface-50 dark:bg-surface-800/80">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-surface-800 dark:text-white">{{ $t('notifications.title') }}</h4>
              <p v-if="store.unreadCount > 0" class="text-[11px] text-surface-400">{{ store.unreadCount }} {{ $t('notifications.unread') }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-if="store.unreadCount > 0"
              @click="store.markAllAsReadViaSocket()"
              class="px-2.5 py-1.5 text-xs font-medium text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            >
              {{ $t('notifications.markAllRead') }}
            </button>
            <button @click="store.closePanel()" class="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="store.loading" class="p-8 text-center">
          <div class="inline-block w-6 h-6 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          <p class="text-xs text-surface-400 mt-2">{{ $t('common.loading') }}</p>
        </div>

        <!-- Empty -->
        <div v-else-if="store.notifications.length === 0" class="p-8 text-center">
          <div class="w-14 h-14 mx-auto mb-3 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center">
            <svg class="w-7 h-7 text-surface-300 dark:text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p class="text-sm font-medium text-surface-600 dark:text-surface-300">{{ $t('notifications.noNotifications') }}</p>
          <p class="text-xs text-surface-400 mt-1">{{ $t('notifications.noNotificationsDesc') }}</p>
        </div>

        <!-- List -->
        <div v-else class="max-h-[420px] overflow-y-auto divide-y divide-surface-100 dark:divide-surface-700">
          <div
            v-for="notif in store.notifications"
            :key="notif._id"
            class="flex items-start gap-3 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-700/50 cursor-pointer transition-all group relative"
            :class="{ 'bg-primary-50/30 dark:bg-primary-900/5': !notif.read }"
            @click="handleClick(notif)"
          >
            <!-- Unread dot -->
            <span v-if="!notif.read" class="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-500 rounded-full"></span>

            <!-- Icon -->
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              :class="iconBgClass(notif.type)">
              {{ store.getNotificationIcon(notif.type) }}
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-semibold text-surface-800 dark:text-white truncate" :class="{ 'font-bold': !notif.read }">
                  {{ notif.title }}
                </p>
                <span class="text-[10px] text-surface-400 flex-shrink-0 whitespace-nowrap">{{ store.getRelativeTime(notif.createdAt) }}</span>
              </div>
              <p class="text-xs text-surface-500 dark:text-surface-400 mt-0.5 line-clamp-2">{{ notif.message }}</p>
            </div>

            <!-- Action buttons -->
            <div class="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                v-if="!notif.read"
                @click.stop="store.markAsReadViaSocket(notif._id)"
                class="p-1.5 text-surface-400 hover:text-primary-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                :title="$t('notifications.markRead')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </button>
              <button
                @click.stop="store.deleteNotification(notif._id)"
                class="p-1.5 text-surface-400 hover:text-red-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                :title="$t('common.delete')"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 flex items-center justify-between">
          <router-link
            to="/notifications"
            @click="store.closePanel()"
            class="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
          >
            {{ $t('notifications.viewAll') }}
          </router-link>
          <span v-if="store.notifications.length > 0" class="text-[10px] text-surface-400">
            {{ store.notifications.filter(n => !n.read).length }} unread
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'

const store = useNotificationStore()
const auth = useAuthStore()
const router = useRouter()
const bellRef = ref<HTMLElement | null>(null)

function togglePanel() {
  store.togglePanel()
}

function handleClick(notif: any) {
  // Mark as read
  if (!notif.read) {
    store.markAsReadViaSocket(notif._id)
  }
  // Navigate if there's a link
  if (notif.link) {
    store.closePanel()
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

// Close panel on outside click
function handleOutsideClick(e: MouseEvent) {
  if (bellRef.value && !bellRef.value.contains(e.target as Node)) {
    store.closePanel()
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.notif-panel-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.notif-panel-leave-active {
  transition: all 0.15s ease-in;
}
.notif-panel-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
.notif-panel-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes scaleIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
</style>
