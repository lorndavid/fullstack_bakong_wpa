<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-800 dark:text-white">{{ $t('profile.title') }}</h1>
    </div>

    <!-- Tab Navigation -->
    <div class="flex bg-white dark:bg-surface-800 rounded-xl p-1 shadow-card border border-surface-100 dark:border-surface-700">
      <button
        v-for="tab in tabs" :key="tab.key"
        @click="activeTab = tab.key"
        class="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-200"
        :class="activeTab === tab.key
          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 shadow-sm'
          : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'"
      >
        <span class="sm:hidden">{{ tab.icon }}</span>
        <span class="hidden sm:inline">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Tab: Profile Info -->
    <div v-if="activeTab === 'profile'" class="space-y-5">
      <!-- Avatar Card -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <!-- Avatar with Google profile image -->
          <div class="relative flex-shrink-0">
            <div class="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary-100 dark:ring-primary-900/50 shadow-lg">
              <img
                v-if="auth.user?.avatar"
                :src="auth.user.avatar"
                :alt="auth.user?.name"
                class="w-full h-full object-cover"
                @error="avatarError = true"
              />
              <div
                v-else
                class="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center"
              >
                <span class="text-3xl font-bold text-white">{{ auth.user?.name?.charAt(0).toUpperCase() }}</span>
              </div>
            </div>
            <!-- Google badge -->
            <div class="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-surface-700 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-surface-700">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
          </div>

          <div class="flex-1 text-center sm:text-left">
            <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ auth.user?.name }}</h2>
            <p class="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{{ auth.user?.email }}</p>
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span class="inline-flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                {{ $t('profile.connectedWithGoogle') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Info -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-5">
        <h3 class="text-base font-semibold text-surface-800 dark:text-white">{{ $t('profile.accountInfo') }}</h3>

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 uppercase tracking-wider">{{ $t('auth.name') }}</label>
            <div class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-700/50 text-surface-800 dark:text-white rounded-lg text-sm border border-surface-200 dark:border-surface-600">
              {{ auth.user?.name }}
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 uppercase tracking-wider">{{ $t('auth.email') }}</label>
            <div class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-700/50 text-surface-500 dark:text-surface-400 rounded-lg text-sm border border-surface-200 dark:border-surface-600">
              {{ auth.user?.email }}
            </div>
          </div>
        </div>

        <div v-if="memberSinceText" class="pt-2">
          <label class="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 uppercase tracking-wider">{{ $t('profile.memberSince', { date: '' }) }}</label>
          <p class="text-sm text-surface-700 dark:text-surface-200">{{ memberSinceText }}</p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card text-center">
          <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ orders.length }}</p>
          <p class="text-xs text-surface-500 mt-1">{{ $t('profile.totalOrders') }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card text-center">
          <p class="text-2xl font-bold text-accent-600 dark:text-accent-400">${{ totalSpent.toFixed(0) }}</p>
          <p class="text-xs text-surface-500 mt-1">Spent</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card text-center">
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ orders.filter(o => o.status === 'delivered').length }}</p>
          <p class="text-xs text-surface-500 mt-1">Delivered</p>
        </div>
      </div>

      <!-- Sign Out -->
      <button @click="handleLogout" class="w-full py-3 flex items-center justify-center gap-2 border-2 border-red-200 dark:border-red-800/50 text-red-500 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        {{ $t('profile.signOut') }}
      </button>
    </div>

    <!-- Tab: Orders -->
    <div v-if="activeTab === 'orders'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-surface-800 dark:text-white">{{ $t('profile.recentOrders') }}</h3>
        <router-link to="/orders" class="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors">
          {{ $t('profile.viewAllOrders') }} →
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="loadingOrders" class="bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-card text-center">
        <div class="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
        <p class="text-sm text-surface-500 mt-3">{{ $t('common.loading') }}</p>
      </div>

      <!-- No orders -->
      <div v-else-if="orders.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-card text-center">
        <div class="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        </div>
        <p class="text-sm text-surface-500 mt-3">{{ $t('profile.noRecentOrders') }}</p>
        <router-link to="/" class="inline-block mt-4 px-5 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors">
          {{ $t('order.startShopping') }}
        </router-link>
      </div>

      <!-- Order List -->
      <div v-else class="space-y-3">
        <div
          v-for="order in recentOrders"
          :key="order._id"
          @click="router.push(`/order/${order._id}`)"
          class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card hover:shadow-md transition-all cursor-pointer border border-surface-100 dark:border-surface-700"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-surface-800 dark:text-white truncate">
                  #{{ order._id.slice(-8).toUpperCase() }}
                </p>
                <p class="text-xs text-surface-500 mt-0.5">{{ formatDate(order.createdAt) }}</p>
              </div>
            </div>
            <div class="text-right flex-shrink-0 ml-3">
              <p class="text-sm font-semibold text-surface-800 dark:text-white">${{ order.total.toFixed(2) }}</p>
              <span
                class="inline-block mt-1 px-2 py-0.5 text-[11px] font-medium rounded-full"
                :class="statusClass(order.status)"
              >
                {{ $t(`order.status.${order.status}`) }}
              </span>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-surface-100 dark:border-surface-700">
            <p class="text-xs text-surface-500">
              {{ order.products.length }} {{ $t('order.items') }} · {{ paymentLabel(order.paymentMethod) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Settings -->
    <div v-if="activeTab === 'settings'" class="space-y-4">
      <!-- Theme -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <h3 class="text-base font-semibold text-surface-800 dark:text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
          {{ $t('profile.theme') }}
        </h3>
        <div class="flex gap-3">
          <button @click="setTheme(false)"
            class="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border-2 transition-all"
            :class="!theme.isDark ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-surface-200 dark:border-surface-600 text-surface-500 hover:border-surface-300'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span class="text-sm font-medium">{{ $t('profile.themeLight') }}</span>
          </button>
          <button @click="setTheme(true)"
            class="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border-2 transition-all"
            :class="theme.isDark ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-surface-200 dark:border-surface-600 text-surface-500 hover:border-surface-300'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            <span class="text-sm font-medium">{{ $t('profile.themeDark') }}</span>
          </button>
        </div>
      </div>

      <!-- Language -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <h3 class="text-base font-semibold text-surface-800 dark:text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
          {{ $t('profile.language') }}
        </h3>
        <div class="flex gap-3">
          <button @click="setLocale('en')"
            class="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border-2 transition-all"
            :class="locale === 'en' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-surface-200 dark:border-surface-600 text-surface-500 hover:border-surface-300'">
            <span class="text-lg">🇺🇸</span>
            <span class="text-sm font-medium">English</span>
          </button>
          <button @click="setLocale('km')"
            class="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border-2 transition-all"
            :class="locale === 'km' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-surface-200 dark:border-surface-600 text-surface-500 hover:border-surface-300'">
            <span class="text-lg">🇰🇭</span>
            <span class="text-sm font-medium">ភាសាខ្មែរ</span>
          </button>
        </div>
      </div>

      <!-- Accessibility -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <h3 class="text-base font-semibold text-surface-800 dark:text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {{ $t('profile.accessibility') }}
        </h3>
        <div class="space-y-3">
          <label class="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700/50 cursor-pointer transition-colors">
            <span class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ $t('accessibility.reduceMotion') }}</span>
            <div class="relative">
              <input type="checkbox" v-model="reduceMotion" @change="toggleReduceMotion" class="sr-only peer" />
              <div class="w-10 h-6 bg-surface-200 dark:bg-surface-600 rounded-full peer-checked:bg-primary-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow after:transition-all peer-checked:after:translate-x-4"></div>
            </div>
          </label>
          <label class="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700/50 cursor-pointer transition-colors">
            <span class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ $t('accessibility.highContrast') }}</span>
            <div class="relative">
              <input type="checkbox" v-model="highContrast" @change="toggleHighContrast" class="sr-only peer" />
              <div class="w-10 h-6 bg-surface-200 dark:bg-surface-600 rounded-full peer-checked:bg-primary-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow after:transition-all peer-checked:after:translate-x-4"></div>
            </div>
          </label>
        </div>
      </div>

      <!-- Cache Center -->
      <CacheCenter />

      <!-- Account Type -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <h3 class="text-base font-semibold text-surface-800 dark:text-white mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          {{ $t('profile.accountInfo') }}
        </h3>
        <div class="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-surface-800 dark:text-white">{{ $t('profile.connectedWithGoogle') }}</p>
            <p class="text-xs text-surface-500 mt-0.5">{{ auth.user?.email }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import CacheCenter from '@/components/CacheCenter.vue'

interface OrderItem {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
}

interface Order {
  _id: string
  userId: string
  products: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  paymentMethod: 'khqr' | 'cod' | 'aba_payway'
  createdAt: string
}

const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()
const { locale, t } = useI18n()

type TabKey = 'profile' | 'orders' | 'settings'

const activeTab = ref<TabKey>('profile')
const avatarError = ref(false)
const orders = ref<Order[]>([])
const loadingOrders = ref(false)
const totalSpent = ref(0)

const tabs = computed<{ key: TabKey; label: string; icon: string }[]>(() => [
  { key: 'profile', label: t('profile.tabProfile'), icon: '👤' },
  { key: 'orders', label: t('profile.tabOrders'), icon: '📋' },
  { key: 'settings', label: t('profile.tabSettings'), icon: '⚙️' },
])

const reduceMotion = ref(localStorage.getItem('reduce_motion') === 'true')
const highContrast = ref(localStorage.getItem('high_contrast') === 'true')

// Apply accessibility settings on mount
if (reduceMotion.value) {
  document.documentElement.classList.add('reduce-motion')
}
if (highContrast.value) {
  document.documentElement.classList.add('high-contrast')
}

function toggleReduceMotion() {
  localStorage.setItem('reduce_motion', reduceMotion.value ? 'true' : 'false')
  if (reduceMotion.value) {
    document.documentElement.classList.add('reduce-motion')
  } else {
    document.documentElement.classList.remove('reduce-motion')
  }
}

function toggleHighContrast() {
  localStorage.setItem('high_contrast', highContrast.value ? 'true' : 'false')
  if (highContrast.value) {
    document.documentElement.classList.add('high-contrast')
  } else {
    document.documentElement.classList.remove('high-contrast')
  }
}

const memberSinceText = computed(() => {
  // createdAt is available from /auth/me response but not stored in the auth store
  // Could be enhanced later by storing createdAt in the auth store
  return ''
})

const recentOrders = computed(() => orders.value.slice(0, 5))

onMounted(async () => {
  if (auth.isAuthenticated) {
    await fetchOrders()
  }
})

async function fetchOrders() {
  loadingOrders.value = true
  try {
    const data: any = await api.get('/orders')
    orders.value = data.orders || []
    totalSpent.value = orders.value
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0)
  } catch {
    // Silently fail - orders will show empty
  } finally {
    loadingOrders.value = false
  }
}

function setTheme(dark: boolean) {
  if (theme.isDark !== dark) {
    theme.toggle()
  }
}

function setLocale(localeCode: string) {
  locale.value = localeCode
  localStorage.setItem('locale', localeCode)
  document.documentElement.lang = localeCode
}

function paymentLabel(method: string): string {
  const map: Record<string, string> = {
    khqr: 'Bakong KHQR',
    aba_payway: 'ABA PayWay',
    cod: 'COD',
  }
  return map[method] || method.toUpperCase()
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    confirmed: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    shipping: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400',
    delivered: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    cancelled: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  }
  return map[status] || map.pending
}

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>
