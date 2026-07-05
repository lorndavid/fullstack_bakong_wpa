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

    <!-- ── Desktop Dropdown (sm+) ──────────────────────────────── -->
    <Transition name="notif-panel">
      <div
        v-if="store.showPanel"
        class="hidden sm:block absolute right-0 top-full mt-2 w-[380px] sm:w-[420px] bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 overflow-hidden z-50"
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
        <NotificationPanelContent :store="store" @close="store.closePanel()" />
      </div>
    </Transition>

    <!-- ── Mobile Off-canvas (below sm) ───────────────────────── -->
    <Teleport to="body">
      <Transition name="offcanvas">
        <div v-if="store.showPanel" class="sm:hidden fixed inset-0 z-[60] flex justify-end">
          <!-- Backdrop -->
          <div
            class="absolute inset-0 bg-black/40 backdrop-blur-sm"
            @click="store.closePanel()"
          ></div>
          <!-- Panel -->
          <div
            class="relative w-full max-w-sm bg-white dark:bg-surface-800 h-full shadow-2xl flex flex-col overflow-hidden"
          >
            <!-- Header -->
            <div class="px-5 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between bg-surface-50 dark:bg-surface-800/80 flex-shrink-0 safe-top">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <svg class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-[15px] font-bold text-surface-800 dark:text-white">{{ $t('notifications.title') }}</h4>
                  <p v-if="store.unreadCount > 0" class="text-[11px] text-surface-400">{{ store.unreadCount }} {{ $t('notifications.unread') }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button
                  v-if="store.unreadCount > 0"
                  @click="store.markAllAsReadViaSocket()"
                  class="px-3 py-1.5 text-xs font-medium text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  {{ $t('notifications.markAllRead') }}
                </button>
                <button @click="store.closePanel()" class="p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <!-- Content -->
            <div class="flex-1 overflow-y-auto safe-bottom">
              <NotificationPanelContent :store="store" @close="store.closePanel()" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import NotificationPanelContent from '@/components/NotificationPanelContent.vue'

const store = useNotificationStore()
const bellRef = ref<HTMLElement | null>(null)

function togglePanel() {
  store.togglePanel()
}

// Close panel on outside click (desktop only)
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

/* ── Off-canvas mobile panel animation ──────────────────────── */
.offcanvas-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.offcanvas-leave-active {
  transition: all 0.2s ease-in;
}
.offcanvas-enter-from {
  opacity: 0;
}
.offcanvas-enter-from > div:last-child {
  transform: translateX(100%);
}
.offcanvas-leave-to {
  opacity: 0;
}
.offcanvas-leave-to > div:last-child {
  transform: translateX(100%);
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes scaleIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
</style>
