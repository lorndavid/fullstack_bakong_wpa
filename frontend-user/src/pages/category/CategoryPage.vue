<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <h1 class="text-xl sm:text-2xl font-bold text-surface-800 dark:text-white mb-6">{{ $t('category.title') }}</h1>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div v-for="i in 8" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card animate-pulse">
        <div class="w-20 h-20 mx-auto bg-surface-200 dark:bg-surface-700 rounded-2xl mb-4"></div>
        <div class="h-4 w-24 mx-auto bg-surface-200 dark:bg-surface-700 rounded mb-2"></div>
        <div class="h-3 w-16 mx-auto bg-surface-200 dark:bg-surface-700 rounded"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16">
      <svg class="w-20 h-20 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p class="text-surface-500 mb-4">{{ error }}</p>
      <button @click="fetchCategories" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="categories.length === 0" class="text-center py-16">
      <svg class="w-20 h-20 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
      <h2 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-2">{{ $t('category.noCategories') }}</h2>
      <p class="text-surface-500">{{ $t('category.checkBack') }}</p>
    </div>

    <!-- Categories Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="cat in categories"
        :key="cat._id"
        @click="goToCategory(cat._id)"
        class="group bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-250 cursor-pointer hover:-translate-y-1 text-center"
      >
        <div class="w-20 h-20 mx-auto bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/50 dark:to-accent-900/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-250 text-3xl">
          {{ cat.icon }}
        </div>
        <h3 class="font-semibold text-surface-800 dark:text-white">{{ cat.name }}</h3>
        <p class="text-xs text-surface-500 mt-1">{{ cat.productCount ?? 0 }} {{ $t('category.products') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

interface Category {
  _id: string
  name: string
  icon: string
  productCount?: number
}

const router = useRouter()
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchCategories() {
  loading.value = true
  error.value = null
  try {
    const data: any = await api.get('/categories')
    categories.value = data.categories || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load categories'
    console.error('Failed to fetch categories:', err)
  } finally {
    loading.value = false
  }
}

function goToCategory(id: string) {
  router.push(`/category/${id}`)
}

onMounted(() => {
  fetchCategories()
})
</script>
