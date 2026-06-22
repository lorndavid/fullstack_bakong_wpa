<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <h1 class="text-xl sm:text-2xl font-bold text-surface-800 dark:text-white mb-6">Categories</h1>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-250 cursor-pointer hover:-translate-y-1 text-center group">
        <div class="w-20 h-20 mx-auto bg-primary-50 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-250">
          <svg class="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <h3 class="font-semibold text-surface-800 dark:text-white">Category {{ i }}</h3>
        <p class="text-xs text-surface-500 mt-1">{{ i * 10 }} products</p>
      </div>
    </div>
  </div>
</template>
