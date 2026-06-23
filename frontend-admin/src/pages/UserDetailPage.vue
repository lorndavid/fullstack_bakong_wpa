<template>
  <div class="space-y-6">
    <!-- Back button -->
    <button @click="router.push('/users')" class="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      Back to Users
    </button>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl p-12 shadow-card text-center">
      <div class="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
      <p class="text-sm text-surface-500 mt-4">Loading user...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl p-12 shadow-card text-center">
      <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <p class="text-sm text-surface-500 mt-4">{{ error }}</p>
    </div>

    <!-- User Detail -->
    <template v-if="user">
      <!-- User Header Card -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div class="w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary-100 dark:ring-primary-900/50 flex-shrink-0">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              :alt="user.name"
              class="w-full h-full object-cover"
              @error="avatarError = true"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center"
            >
              <span class="text-2xl font-bold text-white">{{ user.name?.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          <div class="flex-1 text-center sm:text-left">
            <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ user.name }}</h2>
            <p class="text-sm text-surface-500 mt-0.5">{{ user.email }}</p>
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span
                class="px-2.5 py-1 rounded-full text-xs font-medium"
                :class="user.role === 'admin'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300'"
              >
                {{ user.role === 'admin' ? 'Admin' : 'User' }}
              </span>
              <span class="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-xs font-medium">
                {{ user.provider === 'google' ? 'Google' : 'Email' }}
              </span>
              <span class="text-xs text-surface-400">
                Joined {{ formatDate(user.createdAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card text-center">
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ ordersCount }}</p>
          <p class="text-xs text-surface-500 mt-1">Total Orders</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card text-center">
          <p class="text-2xl font-bold text-accent-600 dark:text-accent-400">${{ totalSpent.toFixed(2) }}</p>
          <p class="text-xs text-surface-500 mt-1">Total Spent</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card text-center">
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ userOrders.filter(o => o.status === 'delivered').length }}</p>
          <p class="text-xs text-surface-500 mt-1">Delivered</p>
        </div>
      </div>

      <!-- Tabs: Orders / Login History -->
      <div class="flex gap-2 mb-2">
        <button @click="detailTab = 'orders'" class="px-4 py-2 text-sm font-medium rounded-lg transition-all"
          :class="detailTab === 'orders' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'">
          Order History
        </button>
        <button @click="detailTab = 'logins'" class="px-4 py-2 text-sm font-medium rounded-lg transition-all"
          :class="detailTab === 'logins' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'">
          Login History
        </button>
      </div>

      <!-- Order History Tab -->
      <div v-if="detailTab === 'orders'" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
        <div class="px-6 py-4 border-b border-surface-200 dark:border-surface-700">
          <h3 class="text-base font-semibold text-surface-800 dark:text-white">Order History</h3>
        </div>

        <div v-if="loadingOrders" class="p-8 text-center">
          <div class="w-6 h-6 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
          <p class="text-sm text-surface-500 mt-3">Loading orders...</p>
        </div>

        <div v-else-if="userOrders.length === 0" class="p-8 text-center">
          <div class="w-12 h-12 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-6 h-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <p class="text-sm text-surface-500 mt-3">This user has no orders yet.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Order</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Items</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Total</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Payment</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
              <tr v-for="order in userOrders" :key="order._id"
                class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                <td class="px-4 py-3">
                  <span class="text-sm font-mono text-primary-600 dark:text-primary-400 font-medium">
                    #{{ order._id.slice(-8).toUpperCase() }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{{ order.products.length }}</td>
                <td class="px-4 py-3 text-sm font-medium text-surface-800 dark:text-white">${{ order.total.toFixed(2) }}</td>
                <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">
                  {{ order.paymentMethod === 'khqr' ? 'KHQR' : 'COD' }}
                </td>
                <td class="px-4 py-3">
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="statusClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-surface-500">{{ formatDate(order.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="orderPages > 1" class="px-6 py-3 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between">
          <p class="text-xs text-surface-500">Page {{ orderPage }} of {{ orderPages }}</p>
          <div class="flex gap-2">
            <button @click="changeOrderPage(-1)" :disabled="orderPage <= 1"
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-600 disabled:opacity-40 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">Previous</button>
            <button @click="changeOrderPage(1)" :disabled="orderPage >= orderPages"
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-600 disabled:opacity-40 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">Next</button>
          </div>
        </div>
      </div>

      <!-- Login History Tab -->
      <div v-if="detailTab === 'logins'" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
        <div class="px-6 py-4 border-b border-surface-200 dark:border-surface-700">
          <h3 class="text-base font-semibold text-surface-800 dark:text-white">Login / Logout History</h3>
        </div>

        <div v-if="loadingLoginHistory" class="p-8 text-center">
          <div class="w-6 h-6 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
          <p class="text-sm text-surface-500 mt-3">Loading login history...</p>
        </div>

        <div v-else-if="loginEvents.length === 0" class="p-8 text-center">
          <div class="w-12 h-12 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-6 h-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <p class="text-sm text-surface-500 mt-3">No login history recorded yet.</p>
          <p class="text-xs text-surface-400 mt-1">Events will appear when the user signs in or out.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Action</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Date & Time</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">IP Address</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase">User Agent</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
              <tr v-for="event in loginEvents" :key="event._id"
                class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                <td class="px-4 py-3">
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium" :class="actionClass(event.action)">
                    {{ formatAction(event.action) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{{ formatDateTime(event.createdAt) }}</td>
                <td class="px-4 py-3 text-sm text-surface-500 font-mono">{{ event.ip || '—' }}</td>
                <td class="px-4 py-3 text-sm text-surface-400 max-w-[200px] truncate" :title="event.userAgent">
                  {{ event.userAgent ? event.userAgent.slice(0, 40) + '...' : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="loginPages > 1" class="px-6 py-3 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between">
          <p class="text-xs text-surface-500">Page {{ loginPage }} of {{ loginPages }}</p>
          <div class="flex gap-2">
            <button @click="changeLoginPage(-1)" :disabled="loginPage <= 1"
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-600 disabled:opacity-40 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">Previous</button>
            <button @click="changeLoginPage(1)" :disabled="loginPage >= loginPages"
              class="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-600 disabled:opacity-40 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  role: string
  provider: string
  createdAt: string
}

interface Order {
  _id: string
  products: any[]
  total: number
  status: string
  paymentMethod: string
  createdAt: string
}

interface LoginEvent {
  _id: string
  userId: string
  action: 'login' | 'logout' | 'google_login' | 'token_refresh'
  ip?: string
  userAgent?: string
  createdAt: string
}

const route = useRoute()
const router = useRouter()

const user = ref<User | null>(null)
const ordersCount = ref(0)
const totalSpent = ref(0)
const userOrders = ref<Order[]>([])
const loginEvents = ref<LoginEvent[]>([])
const loading = ref(true)
const loadingOrders = ref(false)
const loadingLoginHistory = ref(false)
const error = ref('')
const avatarError = ref(false)

// Order pagination
const orderPage = ref(1)
const orderPages = ref(1)

// Login history pagination
const loginPage = ref(1)
const loginPages = ref(1)

// Tab state
const detailTab = ref<'orders' | 'logins'>('orders')

onMounted(async () => {
  const userId = route.params.id as string
  await Promise.all([fetchUser(userId), fetchOrders(userId), fetchLoginHistory(userId)])
})

// Reset pagination when navigating to a different user
watch(() => route.params.id, () => {
  orderPage.value = 1
  loginPage.value = 1
  const userId = route.params.id as string
  Promise.all([fetchUser(userId), fetchOrders(userId), fetchLoginHistory(userId)])
})

async function fetchUser(id: string) {
  loading.value = true
  error.value = ''
  try {
    const data: any = await api.get(`/users/${id}`)
    user.value = data.user
    ordersCount.value = data.ordersCount || 0
    totalSpent.value = data.totalSpent || 0
  } catch (err: any) {
    error.value = err?.message || 'Failed to load user'
  } finally {
    loading.value = false
  }
}

async function fetchOrders(id: string) {
  loadingOrders.value = true
  try {
    const data: any = await api.get(`/users/${id}/orders?page=${orderPage.value}&limit=20`)
    userOrders.value = data.orders || []
    orderPages.value = data.pagination?.pages || 1
  } catch {
    // Silently fail
  } finally {
    loadingOrders.value = false
  }
}

async function fetchLoginHistory(id: string) {
  loadingLoginHistory.value = true
  try {
    const data: any = await api.get(`/users/${id}/login-history?page=${loginPage.value}&limit=50`)
    loginEvents.value = data.events || []
    loginPages.value = data.pagination?.pages || 1
  } catch {
    // Silently fail
  } finally {
    loadingLoginHistory.value = false
  }
}

function changeOrderPage(delta: number) {
  const newPage = orderPage.value + delta
  if (newPage < 1 || newPage > orderPages.value) return
  orderPage.value = newPage
  fetchOrders(route.params.id as string)
}

function changeLoginPage(delta: number) {
  const newPage = loginPage.value + delta
  if (newPage < 1 || newPage > loginPages.value) return
  loginPage.value = newPage
  fetchLoginHistory(route.params.id as string)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    google_login: 'Google Login',
    token_refresh: 'Token Refresh',
  }
  return map[action] || action
}

function actionClass(action: string): string {
  const map: Record<string, string> = {
    login: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    logout: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    google_login: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    token_refresh: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  }
  return map[action] || map.login
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shipping: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return map[status] || map.pending
}
</script>
