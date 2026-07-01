<template>
  <div class="h-screen overflow-hidden bg-surface-50 dark:bg-surface-900 flex">
    <!-- Sidebar (Desktop) -->
    <aside class="w-64 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 hidden lg:flex flex-col h-screen">
      <div class="p-6">
        <router-link to="/" class="flex items-center space-x-2.5">
          <div v-if="siteLogo" class="w-9 h-9 flex items-center justify-center">
            <img :src="siteLogo" alt="Logo" class="w-full h-full object-contain" />
          </div>
          <div v-else class="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
            <span class="text-white font-bold text-base">M</span>
          </div>
          <span class="font-bold text-lg text-surface-800 dark:text-white tracking-tight">{{ $t('app.name') }}</span>
        </router-link>
      </div>

      <!-- User info at top of sidebar -->
      <div class="mx-3 mb-2 px-3 py-2.5 bg-surface-50 dark:bg-surface-700/50 rounded-xl flex items-center gap-3">
        <div class="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-primary-100 dark:bg-primary-900/50">
          <img v-if="auth.user?.avatar" :src="auth.user.avatar" :alt="auth.user.name" class="w-full h-full object-cover" @error="avatarError = true" />
          <div v-if="!auth.user?.avatar || avatarError" class="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span class="text-sm font-bold text-white">{{ auth.user?.name?.charAt(0).toUpperCase() }}</span>
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-surface-800 dark:text-white truncate">{{ auth.user?.name }}</p>
          <p class="text-xs text-surface-500 dark:text-surface-400 truncate">{{ auth.user?.email }}</p>
        </div>
      </div>

      <nav class="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <template v-for="item in navItems" :key="item.path || item.label">
          <!-- Regular nav item -->
          <router-link v-if="!item.type" :to="item.path!"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
            :class="$route.path === item.path || ($route.path.startsWith(item.path + '/') && item.path !== '/')
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50'">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="item.icon"></svg>
            <span>{{ item.label }}</span>
          </router-link>
          <!-- Group nav item (expandable) -->            <div v-else class="space-y-0.5">
            <button @click="toggleGroup(item.groupKey || item.label)"
              class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
              :class="isGroupOpen(item.groupKey || item.label)
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50'">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="item.icon"></svg>
              <span class="flex-1 text-left">{{ item.label }}</span>
              <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isGroupOpen(item.groupKey || item.label) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div v-if="isGroupOpen(item.groupKey || item.label)" class="ml-8 space-y-0.5 overflow-hidden">
              <router-link v-for="child in item.children" :key="child.path" :to="child.path"
                class="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                :class="$route.path === child.path
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700/50'">
                <span class="w-1.5 h-1.5 rounded-full" :class="$route.path === child.path ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-600'"></span>
                <span>{{ child.label }}</span>
              </router-link>
            </div>
          </div>
        </template>
      </nav>

      <div class="p-3 border-t border-surface-200 dark:border-surface-700 mt-2">
        <button @click="showLogoutModal = true" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-all duration-150">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span>{{ $t('nav.signOut') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <!-- Top Bar -->
      <header class="h-16 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
        <div class="flex items-center space-x-3">
          <button @click="showMobileMenu = !showMobileMenu" class="lg:hidden p-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div>
            <h1 class="text-lg font-semibold text-surface-800 dark:text-white">{{ pageTitle }}</h1>
            <p class="text-xs text-surface-400 hidden sm:block">{{ currentDate }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <LanguageSwitcher />

          <!-- Low Stock Alert -->
          <div class="relative" ref="lowStockRef">
            <button @click="toggleLowStock" class="relative p-2.5 text-surface-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              :title="'Low Stock Products'" :class="{ 'text-amber-500': lowStockCount > 0 }">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <!-- Red badge -->
              <span v-if="lowStockCount > 0"
                class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm animate-scale-badge">
                {{ lowStockCount > 99 ? '99+' : lowStockCount }}
              </span>
            </button>

            <!-- Dropdown Panel -->
            <Transition name="dropdown">
              <div v-if="showLowStock"
                class="absolute right-0 top-full mt-2 w-[380px] sm:w-[420px] bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 overflow-hidden z-50">
                <div class="px-5 py-3.5 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between bg-surface-50 dark:bg-surface-800/80">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                      <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-sm font-bold text-surface-800 dark:text-white">Low Stock Alert</h4>
                      <p class="text-[11px] text-surface-400">{{ lowStockCount }} product{{ lowStockCount !== 1 ? 's' : '' }} at or below {{ lowStockThreshold }} units</p>
                    </div>
                  </div>
                  <button @click="showLowStock = false" class="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <!-- Loading -->
                <div v-if="lowStockLoading" class="p-8 text-center">
                  <div class="inline-block w-6 h-6 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                  <p class="text-xs text-surface-400 mt-2">Loading...</p>
                </div>

                <!-- Empty -->
                <div v-else-if="lowStockProducts.length === 0" class="p-8 text-center">
                  <svg class="w-10 h-10 mx-auto text-surface-300 dark:text-surface-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-sm text-surface-500">All products are well-stocked!</p>
                </div>

                <!-- Product List -->
                <div v-else class="max-h-[380px] overflow-y-auto divide-y divide-surface-100 dark:divide-surface-700">
                  <div
                    v-for="product in lowStockProducts"
                    :key="product._id"
                    class="flex items-center gap-3 px-5 py-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 cursor-pointer transition-all group"
                    @click="editProduct(product)">
                    <!-- Image -->
                    <div class="w-11 h-11 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-700 flex-shrink-0 border border-surface-200 dark:border-surface-600">
                      <img v-if="product.images && product.images[0]" :src="product.images[0].secure_url" :alt="product.name" class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                      </div>
                    </div>
                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-surface-800 dark:text-white truncate group-hover:text-primary-500 transition-colors">{{ product.name }}</p>
                      <p class="text-xs text-surface-400 truncate">{{ getCategoryLabel(product.category) }} · ${{ product.price.toFixed(2) }}</p>
                    </div>
                    <!-- Stock Badge -->
                    <div class="flex-shrink-0">
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        :class="product.stock <= 0
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                        </svg>
                        {{ product.stock }}
                      </span>
                    </div>
                    <!-- Edit icon -->
                    <svg class="w-4 h-4 text-surface-300 dark:text-surface-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>

                <!-- View All button -->
                <div v-if="lowStockProducts.length > 0" class="px-5 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                  <router-link to="/products" @click="showLowStock = false"
                    class="block w-full text-center py-2 text-sm font-medium text-primary-500 hover:text-primary-600 bg-white dark:bg-surface-700 rounded-lg border border-surface-200 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-600 transition-all">
                    View All Products
                  </router-link>
                </div>
              </div>
            </Transition>
          </div>

          <button @click="toggleTheme" class="p-2.5 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          </button>
          <!-- User avatar in top bar (mobile) -->
          <div class="flex items-center gap-2 pl-2 border-l border-surface-200 dark:border-surface-700">
            <div class="w-8 h-8 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/50 hidden sm:block">
              <img v-if="auth.user?.avatar && !avatarErrorMob" :src="auth.user.avatar" :alt="auth.user.name" class="w-full h-full object-cover" @error="avatarErrorMob = true" />
              <div v-if="!auth.user?.avatar || avatarErrorMob" class="w-full h-full flex items-center justify-center">
                <span class="text-xs font-bold text-primary-600 dark:text-primary-400">{{ auth.user?.name?.charAt(0).toUpperCase() }}</span>
              </div>
            </div>
            <span class="hidden sm:block text-sm font-medium text-surface-600 dark:text-surface-300">{{ auth.user?.name }}</span>
          </div>
        </div>
      </header>


      <!-- Mobile Sidebar -->
      <div v-if="showMobileMenu" @click="showMobileMenu = false" class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"></div>
      <aside v-if="showMobileMenu" class="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-surface-800 shadow-2xl lg:hidden flex flex-col">
        <div class="p-6 border-b border-surface-200 dark:border-surface-700">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2.5">
              <div v-if="siteLogo" class="w-8 h-8 flex items-center justify-center">
                <img :src="siteLogo" alt="Logo" class="w-full h-full object-contain" />
              </div>
              <div v-else class="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold">M</span>
              </div>
              <span class="font-bold text-lg text-surface-800 dark:text-white">{{ $t('app.name') }}</span>
            </div>
            <button @click="showMobileMenu = false" class="p-2 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="flex items-center gap-3 px-3 py-2.5 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
            <div class="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-primary-100 dark:bg-primary-900/50">
              <img v-if="auth.user?.avatar && !avatarMobile" :src="auth.user.avatar" alt="" class="w-full h-full object-cover" @error="avatarMobile = true" />
              <div v-if="!auth.user?.avatar || avatarMobile" class="w-full h-full flex items-center justify-center">
                <span class="text-sm font-bold text-primary-600 dark:text-primary-400">{{ auth.user?.name?.charAt(0).toUpperCase() }}</span>
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-surface-800 dark:text-white truncate">{{ auth.user?.name }}</p>
              <p class="text-xs text-surface-500 truncate">{{ auth.user?.email }}</p>
            </div>
          </div>
        </div>
        <nav class="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <template v-for="item in navItems" :key="item.path || item.label">
            <router-link v-if="!item.type" :to="item.path!" @click="showMobileMenu = false"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              :class="$route.path === item.path ? 'bg-primary-50 text-primary-600' : 'text-surface-600 hover:bg-surface-50'">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="item.icon"></svg>
              <span>{{ item.label }}</span>
            </router-link>
            <div v-else class="space-y-0.5">
              <button @click="toggleGroup(item.groupKey || item.label)"
                class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                :class="isGroupOpen(item.groupKey || item.label) ? 'bg-primary-50 text-primary-600' : 'text-surface-600 hover:bg-surface-50'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="item.icon"></svg>
                <span class="flex-1 text-left">{{ item.label }}</span>
                <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isGroupOpen(item.groupKey || item.label) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div v-if="isGroupOpen(item.groupKey || item.label)" class="ml-8 space-y-0.5">
                <router-link v-for="child in item.children" :key="child.path" :to="child.path" @click="showMobileMenu = false"
                  class="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                  :class="$route.path === child.path ? 'bg-primary-50 text-primary-600' : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'">
                  <span class="w-1.5 h-1.5 rounded-full" :class="$route.path === child.path ? 'bg-primary-500' : 'bg-surface-300'"></span>
                  <span>{{ child.label }}</span>
                </router-link>
              </div>
            </div>
          </template>
        </nav>
        <div class="p-3 border-t border-surface-200 dark:border-surface-700">
          <button @click="showMobileMenu = false; showLogoutModal = true" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span>{{ $t('nav.signOut') }}</span>
        </button>
      </div>
    </aside>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <router-view />
      </main>
    </div>

    <!-- Logout Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showLogoutModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showLogoutModal = false"></div>

        <!-- Dialog -->
        <div class="relative w-full max-w-sm bg-white dark:bg-surface-800 rounded-2xl shadow-2xl overflow-hidden animate-modal-pop">
          <div class="p-6 text-center">
            <div class="w-14 h-14 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-surface-800 dark:text-white mb-1.5">{{ $t('nav.signOut') }}?</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400">{{ $t('auth.logoutConfirm') }}</p>
          </div>
          <div class="flex gap-3 p-4 pt-0">
            <button @click="showLogoutModal = false"
              class="flex-1 h-11 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 font-semibold text-sm hover:bg-surface-50 dark:hover:bg-surface-700 active:scale-[0.98] transition-all">
              {{ $t('common.cancel') }}
            </button>
            <button @click="handleLogout"
              class="flex-1 h-11 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(239,68,68,0.3)]">
              {{ $t('nav.signOut') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject, onMounted, onUnmounted, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import api from '@/services/api'

const siteLogo = inject('siteLogo', ref('')) as Ref<string>
const { t, locale } = useI18n()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const showMobileMenu = ref(false)
const showLogoutModal = ref(false)
const isDark = ref(localStorage.getItem('theme') === 'dark')
const avatarError = ref(false)
const avatarErrorMob = ref(false)
const avatarMobile = ref(false)

// ─── Low Stock Alert ──────────────────────────────────────────
const showLowStock = ref(false)
const lowStockCount = ref(0)
const lowStockLoading = ref(false)
const lowStockProducts = ref<any[]>([])
const lowStockThreshold = ref(5)
const lowStockRef = ref<HTMLElement | null>(null)

async function fetchLowStock() {
  try {
    // Fetch settings first for threshold
    const settingsRes: any = await api.get('/settings')
    lowStockThreshold.value = settingsRes.settings?.lowStockThreshold || 5

    const res: any = await api.get(`/products/low-stock/overview?threshold=${lowStockThreshold.value}`)
    lowStockCount.value = res.count || 0
    lowStockProducts.value = res.products || []
  } catch {
    lowStockCount.value = 0
    lowStockProducts.value = []
  }
}

async function toggleLowStock() {
  showLowStock.value = !showLowStock.value
  if (showLowStock.value) {
    lowStockLoading.value = true
    await fetchLowStock()
    lowStockLoading.value = false
  }
}

function getCategoryLabel(cat: any): string {
  if (!cat) return 'N/A'
  if (typeof cat === 'object') return cat.name || 'N/A'
  return 'N/A'
}

function editProduct(product: any) {
  showLowStock.value = false
  router.push(`/products?edit=${product._id}`)
}

// Close dropdown on outside click
function handleOutsideClick(e: MouseEvent) {
  if (lowStockRef.value && !lowStockRef.value.contains(e.target as Node)) {
    showLowStock.value = false
  }
}

let lowStockInterval: ReturnType<typeof setInterval>

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  fetchLowStock()
  // Refresh badge every 30s to keep count current
  lowStockInterval = setInterval(fetchLowStock, 30000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  clearInterval(lowStockInterval)
})

interface NavItem {
  path?: string
  label: string
  icon?: string
  type?: 'group'
  groupKey?: string
  children?: { path: string; label: string }[]
}

const navItems = computed<NavItem[]>(() => [
  { path: '/', label: t('nav.dashboard'), icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>' },
  { type: 'group', groupKey: 'products-group', label: t('nav.products'), icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>',
    children: [
      { path: '/products', label: t('nav.allProducts') },
      { path: '/promotions', label: t('nav.promotions') },
    ]
  },
  { path: '/categories', label: t('nav.categories'), icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>' },
  { path: '/orders', label: t('nav.orders'), icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>' },
  { type: 'group', groupKey: 'users-group', label: t('nav.users'), icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>',
    children: [
      { path: '/users', label: t('nav.allUsers') },
      { path: '/roles', label: t('nav.roles') },
    ]
  },
  { path: '/transactions', label: t('nav.transactions'), icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/>' },
  { path: '/payway-gateway', label: t('nav.paywayGateway'), icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>' },
  { path: '/hero-slides', label: t('nav.heroSlides'), icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>' },
  { path: '/settings', label: t('nav.settings'), icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>' },
])

const openGroups = ref<string[]>(['products-group', 'users-group'])

function toggleGroup(label: string) {
  if (openGroups.value.includes(label)) {
    openGroups.value = openGroups.value.filter(g => g !== label)
  } else {
    openGroups.value.push(label)
  }
}

function isGroupOpen(label: string) {
  return openGroups.value.includes(label)
}

const pageTitle = computed(() => {
  const flatItems = navItems.value.flatMap((item: any) => item.children ? [item, ...item.children] : [item])
  const item = flatItems.find((n: any) => n.path === route.path || route.path.startsWith(n.path + '/'))
  return item?.label || t('nav.dashboard')
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString(locale.value, { weekday: 'long', month: 'long', day: 'numeric' })
})

function handleLogout() {
  showLogoutModal.value = false
  auth.logout()
  router.push('/login')
}

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark')
}
</script>

<style scoped>
.animate-scale-badge {
  animation: scaleBadge 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
@keyframes scaleBadge {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* Dropdown transitions */
.dropdown-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-leave-active {
  transition: all 0.15s ease-in;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* Logout modal transitions */
.modal-enter-active { transition: opacity 0.25s ease; }
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }

.animate-modal-pop {
  animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes modalPop {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
