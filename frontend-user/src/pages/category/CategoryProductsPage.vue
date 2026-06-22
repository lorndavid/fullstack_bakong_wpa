<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <!-- Breadcrumb -->
    <nav class="flex items-center space-x-2 text-sm text-surface-500 mb-4">
      <router-link to="/" class="hover:text-primary-500">Home</router-link>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      <router-link to="/categories" class="hover:text-primary-500">Categories</router-link>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      <span class="text-surface-800 dark:text-white">Category Name</span>
    </nav>

    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-800 dark:text-white">Category Name</h1>
      <select class="px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50">
        <option>Sort by: Latest</option>
        <option>Price: Low to High</option>
        <option>Price: High to Low</option>
        <option>Best Selling</option>
      </select>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <div v-for="i in 8" :key="i" class="group bg-white dark:bg-surface-800 rounded-card shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden cursor-pointer hover:-translate-y-1">
        <div class="aspect-square bg-surface-100 dark:bg-surface-700 relative overflow-hidden">
          <span class="absolute top-2 left-2 px-2 py-0.5 bg-accent-500 text-white text-xs font-bold rounded">-20%</span>
        </div>
        <div class="p-3">
          <h3 class="text-sm font-semibold text-surface-800 dark:text-white truncate">Product {{ i }}</h3>
          <div class="flex items-baseline space-x-2 mt-1">
            <span class="text-sm font-bold text-primary-500">$19.99</span>
            <span class="text-xs text-surface-400 line-through">$24.99</span>
          </div>
          <div class="flex items-center space-x-1 mt-1">
            <div class="flex">
              <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= 4 ? 'text-yellow-400' : 'text-surface-300'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            </div>
            <span class="text-xs text-surface-400">(24)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-center space-x-2 mt-8">
      <button class="w-10 h-10 flex items-center justify-center border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <button v-for="p in 3" :key="p" class="w-10 h-10 rounded-lg text-sm font-medium transition-all"
        :class="p === 1 ? 'bg-primary-500 text-white' : 'border border-surface-200 dark:border-surface-600 text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700'">
        {{ p }}
      </button>
      <button class="w-10 h-10 flex items-center justify-center border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</template>
