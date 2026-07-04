<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('notifications.title') }}</h2>
          <p class="text-xs text-surface-400">{{ $t('notifications.manageDesc') }}</p>
        </div>
      </div>
      <button
        @click="openCreatePanel"
        class="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-all flex items-center gap-2 shadow-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        {{ $t('notifications.createNotification') }}
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-100 dark:border-surface-700 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>              <p class="text-2xl font-bold text-surface-800 dark:text-white">{{ store.stats?.total || 0 }}</p>
            <p class="text-xs text-surface-400">{{ $t('notifications.totalSent') }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-100 dark:border-surface-700 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>              <p class="text-2xl font-bold text-surface-800 dark:text-white">{{ store.stats?.sentToday || 0 }}</p>
            <p class="text-xs text-surface-400">{{ $t('notifications.sentToday') }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-100 dark:border-surface-700 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>              <p class="text-2xl font-bold text-surface-800 dark:text-white">{{ store.stats?.scheduled || 0 }}</p>
            <p class="text-xs text-surface-400">{{ $t('notifications.scheduled') }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-100 dark:border-surface-700 p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-rose-100 dark:bg-rose-900/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>              <p class="text-2xl font-bold text-surface-800 dark:text-white">{{ store.stats?.unread || 0 }}</p>
            <p class="text-xs text-surface-400">{{ $t('notifications.unread') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Search -->
    <div class="flex items-center gap-3">
      <select
        v-model="store.filterType"
        @change="store.fetchNotifications()"
        class="px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50"
      >
        <option value="">{{ $t('notifications.allTypes') }}</option>
        <option value="order_confirmed">Order Confirmed</option>
        <option value="payment_successful">Payment Successful</option>
        <option value="shipping_update">Shipping Update</option>
        <option value="flash_sale">Flash Sale</option>
        <option value="new_coupon">New Coupon</option>
        <option value="wishlist_price_drop">Price Drop</option>
        <option value="admin_broadcast">Broadcast</option>
      </select>
      <span class="text-sm text-surface-400">{{ store.total }} total</span>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-100 dark:border-surface-700 p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
      <p class="text-sm text-surface-400 mt-3">{{ $t('common.loading') }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="store.notifications.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-100 dark:border-surface-700 p-12 text-center">
      <div class="w-16 h-16 mx-auto mb-4 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-surface-300 dark:text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-600 dark:text-surface-300">{{ $t('notifications.noNotifications') }}</h3>
      <p class="text-sm text-surface-400 mt-1">{{ $t('notifications.noNotificationsDesc') }}</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-100 dark:border-surface-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('notifications.type') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('notifications.title') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden sm:table-cell">{{ $t('notifications.audience') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden md:table-cell">{{ $t('notifications.channels') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden sm:table-cell">{{ $t('notifications.date') }}</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
            <tr
              v-for="notif in store.notifications"
              :key="notif._id"
              class="hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors"
            >
              <td class="px-4 py-3.5">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
                  :class="typeBadgeClass(notif.type)">
                  {{ typeLabel(notif.type) }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <p class="text-sm font-medium text-surface-800 dark:text-white">{{ notif.title }}</p>
                <p class="text-xs text-surface-400 truncate max-w-[200px]">{{ notif.message }}</p>
              </td>
              <td class="px-4 py-3.5 hidden sm:table-cell">
                <span class="text-xs text-surface-500">{{ notif.user?.name || 'Broadcast' }}</span>
              </td>
              <td class="px-4 py-3.5 hidden md:table-cell">
                <div class="flex gap-1">
                  <span v-for="ch in notif.channels" :key="ch" class="px-1.5 py-0.5 text-[10px] font-medium rounded"
                    :class="ch === 'in_app' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ch === 'email' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'">
                    {{ ch }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3.5 hidden sm:table-cell">
                <span class="text-xs text-surface-400">{{ formatDate(notif.createdAt) }}</span>
              </td>
              <td class="px-4 py-3.5 text-right">
                <button
                  @click="confirmDelete(notif)"
                  class="p-1.5 text-surface-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  :title="$t('common.delete')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="store.pages > 1" class="px-4 py-3 border-t border-surface-100 dark:border-surface-700 flex items-center justify-between">
        <span class="text-xs text-surface-400">Page {{ store.page }} of {{ store.pages }}</span>
        <div class="flex gap-2">
          <button
            @click="store.fetchNotifications(store.page - 1)"
            :disabled="store.page <= 1"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 disabled:opacity-30 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
          >
            {{ $t('common.previous') }}
          </button>
          <button
            @click="store.fetchNotifications(store.page + 1)"
            :disabled="store.page >= store.pages"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 disabled:opacity-30 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
          >
            {{ $t('common.next') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create Notification Panel (slide-in) -->
    <div v-if="showCreatePanel" class="fixed inset-0 z-50" @click.self="closeCreatePanel">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closeCreatePanel"></div>
      <div class="fixed top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-surface-800 shadow-2xl animate-slide-in-right flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-surface-800 dark:text-white">{{ $t('notifications.createNotification') }}</h3>
              <p class="text-xs text-surface-400">{{ $t('notifications.createDesc') }}</p>
            </div>
          </div>
          <button @click="closeCreatePanel" class="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Form -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <form @submit.prevent="handleCreate" class="space-y-5">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('notifications.title') }} *</label>
              <input v-model="form.title" required maxlength="200"
                class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" />
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('notifications.message') }} *</label>
              <textarea v-model="form.message" rows="3" required maxlength="1000"
                class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 resize-none transition-all"></textarea>
            </div>

            <!-- Type -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('notifications.type') }}</label>
              <select v-model="form.type"
                class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all">
                <option value="admin_broadcast">Broadcast</option>
                <option value="flash_sale">Flash Sale</option>
                <option value="new_coupon">New Coupon</option>
                <option value="order_confirmed">Order Confirmed</option>
                <option value="payment_successful">Payment Successful</option>
                <option value="shipping_update">Shipping Update</option>
                <option value="wishlist_price_drop">Price Drop</option>
              </select>
            </div>

            <!-- Audience -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">{{ $t('notifications.audience') }} *</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.audience" value="all_users" class="w-4 h-4 text-primary-500 focus:ring-primary-500" />
                  <span class="text-sm text-surface-700 dark:text-surface-200">{{ $t('notifications.allUsers') }}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.audience" value="all_admins" class="w-4 h-4 text-primary-500 focus:ring-primary-500" />
                  <span class="text-sm text-surface-700 dark:text-surface-200">{{ $t('notifications.allAdmins') }}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.audience" value="single_user" class="w-4 h-4 text-primary-500 focus:ring-primary-500" />
                  <span class="text-sm text-surface-700 dark:text-surface-200">{{ $t('notifications.singleUser') }}</span>
                </label>
                <div v-if="form.audience === 'single_user'" class="ml-6">
                  <input v-model="form.userId" placeholder="User ID"
                    class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" />
                </div>
              </div>
            </div>

            <!-- Channels -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">{{ $t('notifications.channels') }}</label>
              <div class="flex flex-wrap gap-3">
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" v-model="form.channels" value="in_app" class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500" />
                  <span class="text-sm text-surface-700 dark:text-surface-200">In-App</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" v-model="form.channels" value="email" class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500" />
                  <span class="text-sm text-surface-700 dark:text-surface-200">Email</span>
                </label>
              </div>
            </div>

            <!-- Schedule -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('notifications.scheduleFor') }}</label>
              <input v-model="form.scheduledFor" type="datetime-local"
                class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" />
              <p class="text-xs text-surface-400 mt-1">{{ $t('notifications.scheduleHint') }}</p>
            </div>

            <!-- Link -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('notifications.link') }}</label>
              <input v-model="form.link" placeholder="/order/... or /product/..."
                class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" />
              <p class="text-xs text-surface-400 mt-1">{{ $t('notifications.linkHint') }}</p>
            </div>

            <!-- Submit error -->
            <div v-if="submitError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3.5 rounded-xl">{{ submitError }}</div>

            <!-- Submit success -->
            <div v-if="submitSuccess" class="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm p-3.5 rounded-xl">{{ submitSuccess }}</div>
          </form>
        </div>

        <!-- Footer -->
        <div class="flex items-center gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 flex-shrink-0">
          <button type="button" @click="closeCreatePanel" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-surface-700 transition-all">
            {{ $t('common.cancel') }}
          </button>
          <button type="submit" @click="handleCreate" :disabled="saving" class="flex-1 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-all shadow-sm">
            <span v-if="saving" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              {{ $t('common.saving') }}
            </span>
            <span v-else>{{ form.scheduledFor ? $t('notifications.scheduleNotification') : $t('notifications.sendNotification') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="deletingNotif" class="fixed inset-0 z-50">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="deletingNotif = null"></div>
      <div class="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-surface-800 shadow-2xl animate-slide-in-right flex flex-col">
        <div class="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h3 class="text-xl font-bold text-surface-800 dark:text-white mb-2">{{ $t('common.delete') }} Notification</h3>
          <p class="text-sm text-surface-500 mb-8">Delete "<strong>{{ deletingNotif.title }}</strong>"? This cannot be undone.</p>
        </div>
        <div class="flex items-center gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <button @click="deletingNotif = null" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-surface-700 transition-all">{{ $t('common.cancel') }}</button>
          <button @click="handleDelete" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-all shadow-sm">
            {{ deleting ? $t('common.deleting') : $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const store = useNotificationStore()

const showCreatePanel = ref(false)
const saving = ref(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref<string | null>(null)
const deletingNotif = ref<any>(null)
const deleting = ref(false)

const form = ref({
  title: '',
  message: '',
  type: 'admin_broadcast',
  audience: 'all_users' as 'all_users' | 'all_admins' | 'single_user',
  userId: '',
  channels: ['in_app'] as string[],
  scheduledFor: '',
  link: '',
})

onMounted(() => {
  store.fetchNotifications()
  store.fetchStats()
})

function openCreatePanel() {
  showCreatePanel.value = true
  submitError.value = null
  submitSuccess.value = null
  form.value = {
    title: '',
    message: '',
    type: 'admin_broadcast',
    audience: 'all_users',
    userId: '',
    channels: ['in_app'],
    scheduledFor: '',
    link: '',
  }
}

function closeCreatePanel() {
  showCreatePanel.value = false
  submitError.value = null
  submitSuccess.value = null
}

async function handleCreate() {
  if (!form.value.title || !form.value.message) {
    submitError.value = 'Title and message are required'
    return
  }

  saving.value = true
  submitError.value = null
  submitSuccess.value = null

  const result = await store.createNotification({
    type: form.value.type,
    title: form.value.title,
    message: form.value.message,
    channels: form.value.channels,
    audience: form.value.audience,
    userId: form.value.audience === 'single_user' ? form.value.userId : undefined,
    scheduledFor: form.value.scheduledFor || undefined,
    link: form.value.link || undefined,
  })

  if (result.success) {
    submitSuccess.value = result.message
    setTimeout(() => {
      closeCreatePanel()
      store.fetchNotifications()
      store.fetchStats()
    }, 1500)
  } else {
    submitError.value = result.message
  }

  saving.value = false
}

function confirmDelete(notif: any) {
  deletingNotif.value = notif
}

async function handleDelete() {
  if (!deletingNotif.value) return
  deleting.value = true
  await store.deleteNotification(deletingNotif.value._id)
  deletingNotif.value = null
  deleting.value = false
}

function typeBadgeClass(type: string): string {
  const classes: Record<string, string> = {
    order_confirmed: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    payment_successful: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    shipping_update: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    flash_sale: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    new_coupon: 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    wishlist_price_drop: 'bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
    admin_broadcast: 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
  }
  return classes[type] || 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    order_confirmed: 'Order',
    payment_successful: 'Payment',
    shipping_update: 'Shipping',
    flash_sale: 'Flash Sale',
    new_coupon: 'Coupon',
    wishlist_price_drop: 'Price Drop',
    admin_broadcast: 'Broadcast',
  }
  return labels[type] || type
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.animate-slide-in-right {
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
