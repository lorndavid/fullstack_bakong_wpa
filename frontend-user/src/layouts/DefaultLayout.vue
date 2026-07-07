<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-900 transition-colors duration-200">
    <!-- Announcement Banner -->
    <div class="bg-gradient-to-r from-primary-500 to-accent-500 text-white text-center py-1.5 sm:py-2 px-4 text-xs sm:text-sm font-medium">
      <p class="flex items-center justify-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
        <span><strong class="font-semibold">{{ $t('banner.freeShipping') }}</strong></span>
      </p>
    </div>

    <!-- Top Navbar -->
    <header
      class="sticky top-0 z-50 border-b transition-all duration-300"
      :class="scrolled
        ? 'bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-surface-200/70 dark:border-surface-700/70 shadow-soft'
        : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-2">
            <div v-if="siteLogo" class="w-8 h-8 flex items-center justify-center">
              <img :src="siteLogo" alt="Logo" class="w-full h-full object-contain" />
            </div>
            <div v-else class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">M</span>
            </div>
            <span class="font-bold text-lg text-primary-500 dark:text-primary-300 hidden sm:block">{{ $t('app.name') }}</span>
          </router-link>

          <!-- Search Bar (click to open overlay on mobile, navigate on desktop) -->
          <div class="flex-1 max-w-md mx-2 sm:mx-4">
            <button @click="openSearchOverlay" class="block w-full text-left">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text"
                  :placeholder="$t('nav.search')"
                  class="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg text-sm dark:text-white pointer-events-none cursor-pointer"
                  readonly
                />
              </div>
            </button>
          </div>

          <!-- Right Actions -->
          <div class="flex items-center gap-1 sm:gap-3">
            <!-- Language Switcher -->
            <LanguageSwitcher />

            <!-- Notifications -->
            <NotificationBell v-if="auth.isAuthenticated" />

            <!-- Theme Toggle -->
            <button @click="theme.toggle()" class="p-2 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700" :aria-label="theme.isDark ? 'Light mode' : 'Dark mode'">
              <svg v-if="theme.isDark" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <svg v-else class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            </button>

            <!-- Cart (desktop only — mobile uses bottom nav) -->
            <router-link to="/cart" class="relative p-2 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors hidden sm:block">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
              </svg>
              <span v-if="cart.totalItems > 0" class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                {{ cart.totalItems > 99 ? '99+' : cart.totalItems }}
              </span>
            </router-link>

            <!-- User Menu (desktop only) -->
            <div v-if="auth.isAuthenticated" class="relative hidden sm:block">
              <button @click="showUserMenu = !showUserMenu" class="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                <div class="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary-100 dark:ring-primary-900/50 flex-shrink-0">
                  <img v-if="auth.user?.avatar" :src="auth.user.avatar" :alt="auth.user?.name" class="w-full h-full object-cover" @error="avatarError = true" />
                  <div v-if="!auth.user?.avatar || avatarError" class="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span class="text-primary-600 dark:text-primary-300 font-semibold text-sm">{{ auth.user?.name?.charAt(0).toUpperCase() }}</span>
                  </div>
                </div>
                <span class="hidden sm:block text-sm font-medium text-surface-700 dark:text-surface-200">{{ auth.user?.name }}</span>
              </button>

              <!-- Dropdown -->
              <div v-if="showUserMenu" @click.away="showUserMenu = false" class="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 py-2 animate-scale-in">
                <router-link to="/profile" class="block px-4 py-2 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700">{{ $t('nav.profile') }}</router-link>
                <router-link to="/orders" class="block px-4 py-2 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700">{{ $t('nav.orders') }}</router-link>
                <hr class="my-1 border-surface-200 dark:border-surface-700">
                <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">{{ $t('auth.signOut') }}</button>
              </div>
            </div>

            <router-link v-else to="/auth/login" class="hidden sm:inline-flex items-center px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors">
              {{ $t('auth.signIn') }}
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pb-20 sm:pb-0">
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- Footer (hidden on very small since bottom nav covers) -->
    <AppFooter class="hidden sm:block" />

    <!-- Mobile Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-surface-800/90 backdrop-blur-xl border-t border-surface-200 dark:border-surface-700 sm:hidden safe-bottom">
      <div class="flex items-center justify-around h-16 px-2">
        <router-link to="/" class="flex flex-col items-center space-y-0.5 px-3 py-1 text-surface-500 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          :class="{ 'text-primary-500 dark:text-primary-400': $route.name === 'home' }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span class="text-[10px] font-medium">{{ $t('nav.home') }}</span>
        </router-link>
        <router-link to="/categories" class="flex flex-col items-center space-y-0.5 px-3 py-1 text-surface-500 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          :class="{ 'text-primary-500 dark:text-primary-400': $route.name === 'categories' || $route.name === 'category-products' }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
          <span class="text-[10px] font-medium">{{ $t('nav.categories') }}</span>
        </router-link>
        <!-- Notifications (mobile bottom nav) -->
        <router-link to="/notifications" class="flex flex-col items-center space-y-0.5 px-3 py-1 text-surface-500 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors relative"
          :class="{ 'text-primary-500 dark:text-primary-400': $route.name === 'notifications' }">
          <div class="relative">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span v-if="notifStore.hasUnread" class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {{ notifStore.unreadCount > 99 ? '99+' : notifStore.unreadCount }}
            </span>
          </div>
          <span class="text-[10px] font-medium">{{ $t('nav.notifications') }}</span>
        </router-link>
        <router-link to="/cart" class="flex flex-col items-center space-y-0.5 px-3 py-1 text-surface-500 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors relative"
          :class="{ 'text-primary-500 dark:text-primary-400': $route.name === 'cart' }">
          <div class="relative">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
            </svg>
            <span v-if="cart.totalItems > 0" class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {{ cart.totalItems }}
            </span>
          </div>
          <span class="text-[10px] font-medium">{{ $t('nav.cart') }}</span>
        </router-link>
        <router-link :to="auth.isAuthenticated ? '/profile' : '/auth/login'" class="flex flex-col items-center space-y-0.5 px-3 py-1 text-surface-500 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          :class="{ 'text-primary-500 dark:text-primary-400': $route.name === 'profile' || $route.name === 'orders' || $route.name === 'order-detail' }">
          <div class="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-surface-100 dark:bg-surface-700"
            :class="{ 'ring-2 ring-primary-400': $route.name === 'profile' }">
            <img v-if="auth.isAuthenticated && auth.user?.avatar && !bottomAvatarError" :src="auth.user.avatar" :alt="auth.user?.name" class="w-full h-full object-cover" @error="bottomAvatarError = true" />
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <span class="text-[10px] font-medium">{{ auth.isAuthenticated ? $t('nav.profile') : $t('nav.account') }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Chat Widget (only when logged in) -->
    <ChatWidget v-if="auth.isAuthenticated" />

    <!-- Full-screen Search Overlay -->
    <SearchOverlay :visible="showSearchOverlay" @close="closeSearchOverlay" />

    <!-- Toast Container removed - handled by App.vue -->
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, type Ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useThemeStore } from '@/stores/theme'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import AppFooter from '@/components/AppFooter.vue'
import ChatWidget from '@/components/chat/ChatWidget.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import SearchOverlay from '@/components/SearchOverlay.vue'
import { useNotificationStore } from '@/stores/notification'

const auth = useAuthStore()
const siteLogo = inject('siteLogo', ref('')) as Ref<string>
const cart = useCartStore()
const theme = useThemeStore()
const router = useRouter()

const showUserMenu = ref(false)
const showSearchOverlay = ref(false)
const notifStore = useNotificationStore()
const avatarError = ref(false)
const bottomAvatarError = ref(false)

// Header glassmorphism on scroll
const scrolled = ref(false)
function handleScroll() {
  scrolled.value = window.scrollY > 8
}
onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

// Toast system is now handled in App.vue

function openSearchOverlay() {
  showSearchOverlay.value = true
}

function closeSearchOverlay() {
  showSearchOverlay.value = false
}

function handleLogout() {
  auth.logout()
  showUserMenu.value = false
  router.push('/')
}
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.toast-enter-active {
  transition: all 0.25s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
