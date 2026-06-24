<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-900 transition-colors duration-200">
    <!-- Announcement Banner -->
    <div class="bg-gradient-to-r from-primary-500 to-accent-500 text-white text-center py-1.5 sm:py-2 px-4 text-xs sm:text-sm font-medium">
      <p class="flex items-center justify-center gap-1.5">
        <span>🚚</span>          <span><strong class="font-semibold">{{ $t('banner.freeShipping') }}</strong></span>
      </p>
    </div>

    <!-- Top Navbar -->
    <header class="sticky top-0 z-50 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 shadow-sm">
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

          <!-- Search Bar -->
          <div class="flex-1 max-w-md mx-4">
            <router-link to="/search" class="block">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text"
                  :placeholder="$t('nav.search')"
                  class="w-full pl-10 pr-4 py-2 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white pointer-events-none"
                  readonly
                />
              </div>
            </router-link>
          </div>

          <!-- Language Switcher -->
          <LanguageSwitcher />

          <!-- Right Actions -->
          <div class="flex items-center space-x-3 sm:space-x-4">
            <router-link to="/cart" class="relative p-2 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
              </svg>
              <span v-if="cart.totalItems > 0" class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                {{ cart.totalItems > 99 ? '99+' : cart.totalItems }}
              </span>
            </router-link>

            <!-- Theme Toggle -->
            <button @click="theme.toggle()" class="p-2 text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
              <svg v-if="theme.isDark" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            </button>

            <!-- User Menu -->
            <div v-if="auth.isAuthenticated" class="relative">
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

    <!-- Mobile Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 sm:hidden">
      <div class="flex items-center justify-around h-16 px-2">
        <router-link to="/" class="flex flex-col items-center space-y-0.5 px-3 py-1 text-surface-500 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          :class="{ 'text-primary-500 dark:text-primary-400': $route.name === 'home' }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span class="text-[10px] font-medium">{{ $t('nav.home') }}</span>
        </router-link>
        <router-link to="/categories" class="flex flex-col items-center space-y-0.5 px-3 py-1 text-surface-500 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          :class="{ 'text-primary-500 dark:text-primary-400': $route.name === 'categories' }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
          <span class="text-[10px] font-medium">{{ $t('nav.categories') }}</span>
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
        <router-link v-if="auth.isAuthenticated" to="/orders" class="flex flex-col items-center space-y-0.5 px-3 py-1 text-surface-500 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          :class="{ 'text-primary-500 dark:text-primary-400': $route.name === 'orders' }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          </svg>
          <span class="text-[10px] font-medium">{{ $t('nav.orders') }}</span>
        </router-link>
        <router-link v-else to="/auth/login" class="flex flex-col items-center space-y-0.5 px-3 py-1 text-surface-500 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span class="text-[10px] font-medium">{{ $t('nav.account') }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Toast Container -->
    <div class="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full pointer-events-none">
      <transition-group name="toast">
        <div v-for="toast in toastList" :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm animate-slide-up"
          :class="toastClasses(toast.type)">
          <span v-if="toast.type === 'success'" class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </span>
          <span v-else-if="toast.type === 'error'" class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </span>
          <span class="text-white text-sm font-medium flex-1">{{ toast.message }}</span>
          <button @click="removeToast(toast.id)" class="text-white/70 hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, inject, type Ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useThemeStore } from '@/stores/theme'
import { useToast, Toast } from '@/composables/useToast'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const auth = useAuthStore()
const siteLogo = inject('siteLogo', ref('')) as Ref<string>
const cart = useCartStore()
const theme = useThemeStore()
const router = useRouter()

const showUserMenu = ref(false)
const avatarError = ref(false)

// Toast system
const { toasts: toastList, remove: removeToast } = useToast()
provide('toast', useToast())

function toastClasses(type: Toast['type']) {
  return {
    success: 'bg-accent-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-primary-500',
  }[type]
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
