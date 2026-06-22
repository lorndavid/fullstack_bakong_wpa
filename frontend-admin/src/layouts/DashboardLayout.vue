<template>
  <div class="min-h-screen bg-surface-50 dark:bg-surface-900 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 hidden lg:flex flex-col">
      <div class="p-6">
        <router-link to="/" class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold">M</span>
          </div>
          <span class="font-bold text-lg text-surface-800 dark:text-white">MY SHOP</span>
        </router-link>
      </div>
      <nav class="flex-1 px-3 space-y-1">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="$route.path === item.path 
            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
            : 'text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="item.icon"></svg>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="p-4 border-t border-surface-200 dark:border-surface-700">
        <button @click="handleLogout" class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Bar -->
      <header class="h-16 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between px-4 sm:px-6">
        <div class="flex items-center space-x-3">
          <!-- Mobile menu button -->
          <button @click="showMobileMenu = !showMobileMenu" class="lg:hidden p-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <h1 class="text-lg font-semibold text-surface-800 dark:text-white">{{ pageTitle }}</h1>
        </div>
        <div class="flex items-center space-x-3">
          <button @click="toggleTheme" class="p-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300">
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          </button>
        </div>
      </header>

      <!-- Mobile Sidebar Overlay -->
      <div v-if="showMobileMenu" @click="showMobileMenu = false" class="fixed inset-0 z-40 bg-black/50 lg:hidden"></div>
      <aside v-if="showMobileMenu" class="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-surface-800 shadow-xl lg:hidden">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold">M</span>
              </div>
              <span class="font-bold text-lg">MY SHOP</span>
            </div>
            <button @click="showMobileMenu = false" class="p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        <nav class="px-3 space-y-1">
          <router-link v-for="item in navItems" :key="item.path" :to="item.path" @click="showMobileMenu = false"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            :class="$route.path === item.path ? 'bg-primary-50 text-primary-600' : 'text-surface-600 hover:bg-surface-50'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="item.icon"></svg>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- Content -->
      <main class="flex-1 overflow-auto p-4 sm:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const showMobileMenu = ref(false)
const isDark = ref(localStorage.getItem('theme') === 'dark')

const navItems = [
  { path: '/', label: 'Dashboard', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>' },
  { path: '/products', label: 'Products', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>' },
  { path: '/categories', label: 'Categories', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>' },
  { path: '/orders', label: 'Orders', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>' },
  { path: '/users', label: 'Users', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>' },
  { path: '/transactions', label: 'Transactions', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/>' },
]

const pageTitle = computed(() => {
  const item = navItems.find(n => n.path === route.path)
  return item?.label || 'Dashboard'
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark')
}
</script>
