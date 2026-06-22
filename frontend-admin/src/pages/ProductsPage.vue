<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-surface-800 dark:text-white">Products</h2>
      <button class="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-all flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Product
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" placeholder="Search products..." class="w-full pl-10 pr-4 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
        </div>
        <select class="px-4 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50">
          <option>All Categories</option>
          <option>Fashion</option>
          <option>Electronics</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Product</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Category</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Price</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Stock</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
            <tr v-for="i in 10" :key="i" class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-lg flex-shrink-0"></div>
                  <div>
                    <p class="text-sm font-medium text-surface-800 dark:text-white">Product {{ i }}</p>
                    <p class="text-xs text-surface-400">SKU: PRD-{{ 1000 + i }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">Category</td>
              <td class="px-4 py-3 text-sm font-medium text-surface-800 dark:text-white">${{ (9.99 + i * 5).toFixed(2) }}</td>
              <td class="px-4 py-3">
                <span class="text-sm" :class="i % 3 === 0 ? 'text-red-500' : 'text-surface-600 dark:text-surface-300'">{{ 50 + i * 10 }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="i % 2 === 0 ? 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'">
                  {{ i % 2 === 0 ? 'Active' : 'Draft' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button class="p-1.5 text-surface-400 hover:text-primary-500 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button class="p-1.5 text-surface-400 hover:text-red-500 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700">
        <p class="text-sm text-surface-500">Showing 1-10 of 156</p>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700">Previous</button>
          <button class="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg">1</button>
          <button class="px-3 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700">2</button>
          <button class="px-3 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700">3</button>
          <button class="px-3 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
