<template>
  <div class="min-h-screen bg-white transition-colors duration-200">
    <!-- Announcement Banner -->
    <div class="bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] text-white text-center py-2 sm:py-2.5 px-4 text-xs sm:text-sm font-medium">
      <p class="flex items-center justify-center gap-2">
        <span>✨</span>
        <span>{{ $t('banner.freeShipping') }}</span>
        <span>✨</span>
      </p>
    </div>

    <!-- Top Navbar -->
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#F1E6EA]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-16 sm:h-20">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2.5 group">
            <div class="w-9 h-9 bg-gradient-to-br from-[#FF7AA2] to-[#C084FC] rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
              <span class="text-white font-bold text-sm font-display">G</span>
            </div>
            <span class="font-display font-bold text-xl text-[#1A1A1A] hidden sm:block">{{ $t('app.name') }}</span>
          </router-link>

          <!-- Navigation Links (Desktop) -->
          <nav class="hidden md:flex items-center gap-8">
            <router-link to="/" class="text-sm font-medium text-[#666666] hover:text-[#FF7AA2] transition-colors duration-200">
              {{ $t('nav.home') }}
            </router-link>
            <router-link to="/categories" class="text-sm font-medium text-[#666666] hover:text-[#FF7AA2] transition-colors duration-200">
              {{ $t('nav.categories') }}
            </router-link>
            <router-link to="/search" class="text-sm font-medium text-[#666666] hover:text-[#FF7AA2] transition-colors duration-200">
              {{ $t('nav.search') }}
            </router-link>
          </nav>

          <!-- Right Actions -->
          <div class="flex items-center gap-2 sm:gap-3">
            <!-- Language Switcher -->
            <LanguageSwitcher />

            <!-- Wishlist -->
            <button class="relative p-2 text-[#666666] hover:text-[#FF7AA2] transition-colors duration-200 rounded-xl hover:bg-[#FFF4F7]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>

            <!-- Cart -->
            <router-link to="/cart" class="relative p-2 text-[#666666] hover:text-[#FF7AA2] transition-colors duration-200 rounded-xl hover:bg-[#FFF4F7]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <span v-if="cart.totalItems > 0" class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#FF7AA2] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in shadow-sm">
                {{ cart.totalItems > 99 ? '99+' : cart.totalItems }}
              </span>
            </router-link>

            <!-- User Menu -->
            <div v-if="auth.isAuthenticated" class="relative">
              <button @click="showUserMenu = !showUserMenu" class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#FFF4F7] transition-colors duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-[#FF7AA2] to-[#C084FC] rounded-full flex items-center justify-center shadow-sm">
                  <span class="text-white font-semibold text-sm">{{ auth.user?.name?.charAt(0).toUpperCase() }}</span>
                </div>
              </button>

              <!-- Dropdown -->
              <Transition name="dropdown">
                <div v-if="showUserMenu" class="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-elevated border border-[#F1E6EA] py-2 z-50">
                  <div class="px-4 py-3 border-b border-[#F1E6EA]">
                    <p class="text-sm font-semibold text-[#1A1A1A]">{{ auth.user?.name }}</p>
                    <p class="text-xs text-[#666666]">{{ auth.user?.email }}</p>
                  </div>
                  <router-link to="/profile" @click="showUserMenu = false" class="flex items-center gap-3 px-4 py-2.5 text-sm text-[#666666] hover:text-[#FF7AA2] hover:bg-[#FFF4F7] transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    {{ $t('nav.profile') }}
                  </router-link>
                  <router-link to="/orders" @click="showUserMenu = false" class="flex items-center gap-3 px-4 py-2.5 text-sm text-[#666666] hover:text-[#FF7AA2] hover:bg-[#FFF4F7] transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                    {{ $t('nav.orders') }}
                  </router-link>
                  <hr class="my-1 border-[#F1E6EA]">
                  <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    {{ $t('auth.signOut') }}
                  </button>
                </div>
              </Transition>
            </div>

            <router-link v-else to="/auth/login" class="btn-primary text-xs sm:text-sm !px-4 !py-2 sm:!px-5 sm:!py-2.5">
              {{ $t('auth.signIn') }}
            </router-link>

            <!-- Mobile Menu Toggle -->
            <button @click="showMobileMenu = !showMobileMenu" class="md:hidden p-2 text-[#666666] hover:text-[#FF7AA2] rounded-xl hover:bg-[#FFF4F7] transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition name="mobile-menu">
        <div v-if="showMobileMenu" class="md:hidden border-t border-[#F1E6EA] bg-white">
          <div class="px-4 py-4 space-y-1">
            <router-link to="/" @click="showMobileMenu = false" class="block px-4 py-3 text-sm font-medium text-[#666666] hover:text-[#FF7AA2] hover:bg-[#FFF4F7] rounded-xl transition-all">
              {{ $t('nav.home') }}
            </router-link>
            <router-link to="/categories" @click="showMobileMenu = false" class="block px-4 py-3 text-sm font-medium text-[#666666] hover:text-[#FF7AA2] hover:bg-[#FFF4F7] rounded-xl transition-all">
              {{ $t('nav.categories') }}
            </router-link>
            <router-link to="/search" @click="showMobileMenu = false" class="block px-4 py-3 text-sm font-medium text-[#666666] hover:text-[#FF7AA2] hover:bg-[#FFF4F7] rounded-xl transition-all">
              {{ $t('nav.search') }}
            </router-link>
            <router-link to="/orders" @click="showMobileMenu = false" class="block px-4 py-3 text-sm font-medium text-[#666666] hover:text-[#FF7AA2] hover:bg-[#FFF4F7] rounded-xl transition-all">
              {{ $t('nav.orders') }}
            </router-link>
            <hr class="my-2 border-[#F1E6EA]">
            <router-link to="/profile" @click="showMobileMenu = false" class="block px-4 py-3 text-sm font-medium text-[#666666] hover:text-[#FF7AA2] hover:bg-[#FFF4F7] rounded-xl transition-all">
              {{ $t('nav.profile') }}
            </router-link>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Main Content -->
    <main>
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="bg-[#FFF8FA] border-t border-[#F1E6EA]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          <!-- Brand -->
          <div class="lg:col-span-1">
            <div class="flex items-center gap-2.5 mb-4">
              <div class="w-8 h-8 bg-gradient-to-br from-[#FF7AA2] to-[#C084FC] rounded-xl flex items-center justify-center shadow-sm">
                <span class="text-white font-bold text-sm font-display">G</span>
              </div>
              <span class="font-display font-bold text-lg text-[#1A1A1A]">{{ $t('app.name') }}</span>
            </div>
            <p class="text-sm text-[#666666] leading-relaxed mb-4">{{ $t('app.tagline') }}</p>
            <div class="flex items-center gap-3">
              <a href="#" class="w-9 h-9 bg-white border border-[#F1E6EA] rounded-xl flex items-center justify-center text-[#666666] hover:text-[#FF7AA2] hover:border-[#FF7AA2] transition-all">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" class="w-9 h-9 bg-white border border-[#F1E6EA] rounded-xl flex items-center justify-center text-[#666666] hover:text-[#FF7AA2] hover:border-[#FF7AA2] transition-all">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" class="w-9 h-9 bg-white border border-[#F1E6EA] rounded-xl flex items-center justify-center text-[#666666] hover:text-[#FF7AA2] hover:border-[#FF7AA2] transition-all">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="font-display font-semibold text-base text-[#1A1A1A] mb-4">Shop</h4>
            <ul class="space-y-3">
              <li><router-link to="/categories" class="text-sm text-[#666666] hover:text-[#FF7AA2] transition-colors">All Products</router-link></li>
              <li><router-link to="/categories" class="text-sm text-[#666666] hover:text-[#FF7AA2] transition-colors">Best Sellers</router-link></li>
              <li><router-link to="/search?sort=newest" class="text-sm text-[#666666] hover:text-[#FF7AA2] transition-colors">New Arrivals</router-link></li>
              <li><router-link to="/search?sort=discount" class="text-sm text-[#666666] hover:text-[#FF7AA2] transition-colors">Sale</router-link></li>
            </ul>
          </div>

          <div>
            <h4 class="font-display font-semibold text-base text-[#1A1A1A] mb-4">Support</h4>
            <ul class="space-y-3">
              <li><a href="#" class="text-sm text-[#666666] hover:text-[#FF7AA2] transition-colors">Contact Us</a></li>
              <li><a href="#" class="text-sm text-[#666666] hover:text-[#FF7AA2] transition-colors">FAQ</a></li>
              <li><a href="#" class="text-sm text-[#666666] hover:text-[#FF7AA2] transition-colors">Shipping Policy</a></li>
              <li><a href="#" class="text-sm text-[#666666] hover:text-[#FF7AA2] transition-colors">Returns & Exchanges</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-display font-semibold text-base text-[#1A1A1A] mb-4">Connect</h4>
            <p class="text-sm text-[#666666] leading-relaxed mb-4">Follow us on social media for exclusive offers and skincare tips.</p>
            <div class="flex -space-x-1">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF7AA2] to-[#C084FC] flex items-center justify-center border-2 border-white shadow-sm">
                <span class="text-white text-xs font-bold">G</span>
              </div>
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#C084FC] to-[#FF7AA2] flex items-center justify-center border-2 border-white shadow-sm">
                <span class="text-white text-xs font-bold">F</span>
              </div>
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF7AA2] to-[#FFD5E0] flex items-center justify-center border-2 border-white shadow-sm">
                <span class="text-white text-xs font-bold">T</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-[#F1E6EA] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-sm text-[#C4A8B6]">© 2026 {{ $t('app.name') }}. {{ $t('footer.allRightsReserved') }}</p>
          <div class="flex items-center gap-6">
            <a href="#" class="text-xs text-[#C4A8B6] hover:text-[#FF7AA2] transition-colors">Privacy Policy</a>
            <a href="#" class="text-xs text-[#C4A8B6] hover:text-[#FF7AA2] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>

    <!-- Mobile Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#F1E6EA] md:hidden safe-bottom">
      <div class="flex items-center justify-around h-16 px-2">
        <router-link to="/" class="flex flex-col items-center gap-0.5 px-3 py-1 text-[#C4A8B6] hover:text-[#FF7AA2] transition-colors"
          :class="{ '!text-[#FF7AA2]': $route.name === 'home' }">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span class="text-[10px] font-medium">{{ $t('nav.home') }}</span>
        </router-link>
        <router-link to="/categories" class="flex flex-col items-center gap-0.5 px-3 py-1 text-[#C4A8B6] hover:text-[#FF7AA2] transition-colors"
          :class="{ '!text-[#FF7AA2]': $route.name === 'categories' }">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
          </svg>
          <span class="text-[10px] font-medium">{{ $t('nav.categories') }}</span>
        </router-link>
        <router-link to="/cart" class="flex flex-col items-center gap-0.5 px-3 py-1 text-[#C4A8B6] hover:text-[#FF7AA2] transition-colors relative"
          :class="{ '!text-[#FF7AA2]': $route.name === 'cart' }">
          <div class="relative">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <span v-if="cart.totalItems > 0" class="absolute -top-1.5 -right-2 w-4 h-4 bg-[#FF7AA2] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {{ cart.totalItems }}
            </span>
          </div>
          <span class="text-[10px] font-medium">{{ $t('nav.cart') }}</span>
        </router-link>
        <router-link v-if="auth.isAuthenticated" to="/orders" class="flex flex-col items-center gap-0.5 px-3 py-1 text-[#C4A8B6] hover:text-[#FF7AA2] transition-colors"
          :class="{ '!text-[#FF7AA2]': $route.name === 'orders' }">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
          </svg>
          <span class="text-[10px] font-medium">{{ $t('nav.orders') }}</span>
        </router-link>
        <router-link v-else to="/auth/login" class="flex flex-col items-center gap-0.5 px-3 py-1 text-[#C4A8B6] hover:text-[#FF7AA2] transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          class="pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-elevated backdrop-blur-xl animate-slide-up border"
          :class="toastClasses(toast.type)">
          <span v-if="toast.type === 'success'" class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          </span>
          <span v-else-if="toast.type === 'error'" class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </span>
          <span class="text-white text-sm font-medium flex-1">{{ toast.message }}</span>
          <button @click="removeToast(toast.id)" class="text-white/70 hover:text-white transition-colors flex-shrink-0">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useToast, Toast } from '@/composables/useToast'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)

// Toast system
const { toasts: toastList, remove: removeToast } = useToast()
provide('toast', useToast())

function toastClasses(type: Toast['type']) {
  return {
    success: 'bg-[#34C759] border-[#34C759]/20',
    error: 'bg-red-500 border-red-500/20',
    warning: 'bg-amber-500 border-amber-500/20',
    info: 'bg-[#FF7AA2] border-[#FF7AA2]/20',
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
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.toast-enter-active { transition: all 0.25s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(100px); }
.toast-leave-to { opacity: 0; transform: translateX(100px); }

.dropdown-enter-active { transition: all 0.15s ease-out; }
.dropdown-leave-active { transition: all 0.1s ease-in; }
.dropdown-enter-from { opacity: 0; transform: scale(0.95) translateY(-5px); }
.dropdown-leave-to { opacity: 0; transform: scale(0.95) translateY(-5px); }

.mobile-menu-enter-active { transition: all 0.2s ease-out; }
.mobile-menu-leave-active { transition: all 0.15s ease-in; }
.mobile-menu-enter-from { opacity: 0; max-height: 0; overflow: hidden; }
.mobile-menu-leave-to { opacity: 0; max-height: 0; overflow: hidden; }
</style>
