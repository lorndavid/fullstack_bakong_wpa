<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <!-- Search Bar -->
    <div class="relative mb-6">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search products..."
        class="w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-600 text-surface-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
        autofocus
      />
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      <button v-for="filter in filters" :key="filter.label" @click="selectedFilter = filter.value"
        class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
        :class="selectedFilter === filter.value 
          ? 'bg-primary-500 text-white shadow-md' 
          : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-600 hover:border-primary-300'"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Results -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <div v-for="i in 8" :key="i" class="group bg-white dark:bg-surface-800 rounded-card shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden cursor-pointer hover:-translate-y-1">
        <div class="aspect-square bg-surface-100 dark:bg-surface-700 animate-pulse"></div>
        <div class="p-3">
          <h3 class="text-sm font-semibold text-surface-800 dark:text-white truncate">Search Result {{ i }}</h3>
          <span class="text-sm font-bold text-primary-500">$19.99</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')
const selectedFilter = ref('all')
const filters = [
  { label: 'All', value: 'all' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Home', value: 'home' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Sports', value: 'sports' },
]
</script>
