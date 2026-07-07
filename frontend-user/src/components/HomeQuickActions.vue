<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-6">
    <div class="grid grid-cols-4 gap-2 sm:gap-3">
      <button
        v-for="action in actions"
        :key="action.key"
        @click="handleAction(action)"
        class="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-surface-800 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-surface-100 dark:border-surface-700"
        :aria-label="action.label"
      >
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl" :class="action.bgClass">
          {{ action.icon }}
        </div>
        <span class="text-[10px] sm:text-xs font-medium text-surface-600 dark:text-surface-300 text-center leading-tight">{{ action.label }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

interface QuickAction {
  key: string
  icon: string
  bgClass: string
  label: string
  route: string
  requiresAuth?: boolean
}

const actions: QuickAction[] = [
  {
    key: 'continue-shopping',
    icon: '🛍️',
    bgClass: 'bg-blue-100 dark:bg-blue-900/20',
    label: t('home.continueShopping'),
    route: '/search',
  },
  {
    key: 'flash-sale',
    icon: '⚡',
    bgClass: 'bg-red-100 dark:bg-red-900/20',
    label: t('home.flashSale'),
    route: '/search?sort=discount',
  },
  {
    key: 'recently-viewed',
    icon: '👁️',
    bgClass: 'bg-purple-100 dark:bg-purple-900/20',
    label: t('home.recentlyViewed'),
    route: '/search?sort=newest',
  },
  {
    key: 'wishlist',
    icon: '❤️',
    bgClass: 'bg-pink-100 dark:bg-pink-900/20',
    label: t('profile.wishlist'),
    route: '/profile',
    requiresAuth: true,
  },
  {
    key: 'orders',
    icon: '📋',
    bgClass: 'bg-amber-100 dark:bg-amber-900/20',
    label: t('nav.orders'),
    route: '/orders',
    requiresAuth: true,
  },
  {
    key: 'coupons',
    icon: '🎟️',
    bgClass: 'bg-green-100 dark:bg-green-900/20',
    label: t('coupons.title'),
    route: '/coupons',
  },
  {
    key: 'cart',
    icon: '🛒',
    bgClass: 'bg-cyan-100 dark:bg-cyan-900/20',
    label: t('nav.cart'),
    route: '/cart',
  },
  {
    key: 'categories',
    icon: '📂',
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/20',
    label: t('nav.categories'),
    route: '/categories',
  },
]

function handleAction(action: QuickAction) {
  if (action.requiresAuth && !auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: action.route } })
    return
  }
  router.push(action.route)
}
</script>
