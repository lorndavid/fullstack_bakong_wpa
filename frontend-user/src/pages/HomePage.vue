<template>
  <div class="space-y-6 sm:space-y-8 pb-6">
    <!-- Hero Banner Carousel -->
    <section class="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-800 dark:to-primary-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div class="flex items-center justify-between">
          <div class="max-w-lg space-y-4 animate-slide-up">
            <span class="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">Summer Sale 2024</span>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Shop Smarter<br/>Save Bigger
            </h1>
            <p class="text-white/80 text-sm sm:text-base">Discover amazing deals on premium products. Free shipping on orders over $50.</p>
            <div class="flex items-center space-x-3">
              <router-link to="/search" class="inline-flex items-center px-5 py-2.5 bg-white text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-all text-sm sm:text-base">
                Shop Now
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </router-link>
              <router-link to="/categories" class="inline-flex items-center px-5 py-2.5 text-white border border-white/30 font-medium rounded-lg hover:bg-white/10 transition-all text-sm sm:text-base">
                Browse Categories
              </router-link>
            </div>
          </div>
          <div class="hidden lg:block">
            <div class="w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-50 dark:from-surface-900"></div>
    </section>

    <!-- Categories -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg sm:text-xl font-bold text-surface-800 dark:text-white">Categories</h2>
        <router-link to="/categories" class="text-sm text-primary-500 hover:text-primary-600 font-medium">View All</router-link>
      </div>
      <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        <div v-for="i in 8" :key="i" class="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-surface-800 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-250 cursor-pointer hover:-translate-y-0.5">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-primary-50 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 sm:w-7 sm:h-7 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <span class="text-xs text-surface-600 dark:text-surface-300 font-medium text-center truncate w-full">Fashion</span>
        </div>
      </div>
    </section>

    <!-- Flash Sale -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <h2 class="text-lg sm:text-xl font-bold text-surface-800 dark:text-white">Flash Sale</h2>
          <div class="flex items-center space-x-1.5">
            <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">02</span>
            <span class="text-surface-400 font-bold">:</span>
            <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">15</span>
            <span class="text-surface-400 font-bold">:</span>
            <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">48</span>
          </div>
        </div>
        <router-link to="/search?sort=discount" class="text-sm text-primary-500 hover:text-primary-600 font-medium">View All</router-link>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        <div v-for="i in 4" :key="i" class="group bg-white dark:bg-surface-800 rounded-card shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden cursor-pointer hover:-translate-y-1">
          <div class="relative overflow-hidden">
            <div class="aspect-square bg-surface-100 dark:bg-surface-700 animate-pulse"></div>
            <span class="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">-{{ i * 10 }}%</span>
          </div>
          <div class="p-3">
            <h3 class="text-sm font-semibold text-surface-800 dark:text-white truncate">Product Name</h3>
            <div class="flex items-center space-x-2 mt-1">
              <span class="text-base font-bold text-accent-500">${{ (19.99 * (1 - i * 0.1)).toFixed(2) }}</span>
              <span class="text-xs text-surface-400 line-through">$19.99</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Promotion Banner -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl p-6 sm:p-8 text-white animate-fade-in">
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <span class="inline-block px-3 py-1 bg-white/20 text-xs font-semibold rounded-full">Special Offer</span>
            <h3 class="text-xl sm:text-2xl font-bold">Free Shipping</h3>
            <p class="text-white/80 text-sm">On orders over $50. Use code: FREESHIP</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">$50</div>
            <div class="text-sm text-white/60">minimum order</div>
          </div>
        </div>
      </div>
    </section>

    <!-- New Arrivals -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg sm:text-xl font-bold text-surface-800 dark:text-white">New Arrivals</h2>
        <router-link to="/search?sort=newest" class="text-sm text-primary-500 hover:text-primary-600 font-medium">View All</router-link>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <div v-for="i in 5" :key="i" class="group bg-white dark:bg-surface-800 rounded-card shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden cursor-pointer hover:-translate-y-1">
          <div class="relative overflow-hidden">
            <div class="aspect-square bg-surface-100 dark:bg-surface-700 animate-pulse"></div>
            <span class="absolute top-2 left-2 px-2 py-0.5 bg-accent-500 text-white text-xs font-bold rounded">NEW</span>
          </div>
          <div class="p-3">
            <h3 class="text-sm font-semibold text-surface-800 dark:text-white truncate">New Product</h3>
            <div class="flex items-center space-x-1 mt-1">
              <span class="text-base font-bold text-primary-500">${{ (14.99 + i * 5).toFixed(2) }}</span>
            </div>
            <div class="flex items-center space-x-1 mt-1">
              <div class="flex">
                <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= 4 ? 'text-yellow-400' : 'text-surface-300'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </div>
              <span class="text-xs text-surface-400">({{ 20 + i * 5 }})</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom spacing -->
    <div class="h-4"></div>
  </div>
</template>

<script setup lang="ts">
</script>
