<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <!-- Breadcrumb -->
    <nav class="flex items-center space-x-1.5 xs:space-x-2 text-xs xs:text-sm text-surface-500 mb-4 overflow-x-auto scrollbar-hide whitespace-nowrap">
      <router-link to="/" class="hover:text-primary-500 flex-shrink-0">{{ $t('nav.home') }}</router-link>
      <svg class="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      <router-link to="/categories" class="hover:text-primary-500 flex-shrink-0">{{ $t('nav.categories') }}</router-link>
      <svg class="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      <span class="text-surface-800 dark:text-white truncate max-w-[120px] xs:max-w-[200px]">{{ categoryName }}</span>
    </nav>

    <div class="flex items-center justify-between gap-2 mb-6 flex-wrap">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-800 dark:text-white">{{ categoryName }}</h1>
      <select v-model="sortBy" class="px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50">
        <option value="latest">{{ $t('search.sortLatest') }}</option>
        <option value="lowhigh">{{ $t('search.sortLowHigh') }}</option>
        <option value="highlow">{{ $t('search.sortHighLow') }}</option>
        <option value="bestselling">{{ $t('search.sortBestSelling') }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <div v-for="i in 8" :key="i" class="bg-white dark:bg-surface-800 rounded-card shadow-card overflow-hidden animate-pulse">
        <div class="aspect-square bg-surface-200 dark:bg-surface-700"></div>
        <div class="p-3 space-y-2">
          <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4"></div>
          <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16">
      <p class="text-surface-500 mb-4">{{ error }}</p>
      <button @click="fetchProducts" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="products.length === 0" class="text-center py-16">
      <p class="text-surface-500">{{ $t('home.noNewArrivals') }}</p>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <div
        v-for="product in products"
        :key="product._id"
        @click="goToProduct(product._id)"
        class="group bg-white dark:bg-surface-800 rounded-card shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden cursor-pointer hover:-translate-y-1"
      >
        <div class="aspect-square bg-surface-100 dark:bg-surface-700 relative overflow-hidden">
          <img
            v-if="product.images && product.images.length > 0"
            :src="product.images[0].secure_url"
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="w-12 h-12 text-surface-300 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <span v-if="product.discount > 0" class="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">-{{ product.discount }}%</span>
        </div>
        <div class="p-3">
          <h3 class="text-sm font-semibold text-surface-800 dark:text-white truncate">{{ product.name }}</h3>
          <div class="flex items-baseline space-x-2 mt-1">
            <span class="text-sm font-bold text-primary-500">${{ product.price.toFixed(2) }}</span>
          </div>
          <div class="flex items-center space-x-1 mt-1">
            <div class="flex">
              <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= Math.round(product.rating || 4) ? 'text-yellow-400' : 'text-surface-300'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <span class="text-xs text-surface-400">({{ product.numReviews || 0 }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center space-x-2 mt-8">
      <button @click="prevPage" :disabled="currentPage <= 1"
        class="w-9 h-9 xs:w-10 xs:h-10 flex items-center justify-center border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors disabled:opacity-50">
        <svg class="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <button
        v-for="p in totalPages"
        :key="p"
        @click="goToPage(p)"
        class="w-9 h-9 xs:w-10 xs:h-10 rounded-lg text-xs xs:text-sm font-medium transition-all"
        :class="p === currentPage ? 'bg-primary-500 text-white' : 'border border-surface-200 dark:border-surface-600 text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700'">
        {{ p }}
      </button>
      <button @click="nextPage" :disabled="currentPage >= totalPages"
        class="w-9 h-9 xs:w-10 xs:h-10 flex items-center justify-center border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors disabled:opacity-50">
        <svg class="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

interface Product {
  _id: string
  name: string
  price: number
  discount: number
  images: { public_id: string; secure_url: string }[]
  rating: number
  numReviews: number
}

const route = useRoute()
const router = useRouter()

const categoryName = ref('')
const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const sortBy = ref('latest')

async function fetchProducts() {
  loading.value = true
  error.value = null
  const id = route.params.id as string
  try {
    const data: any = await api.get(`/categories/${id}/products?page=${currentPage.value}&sort=${sortBy.value}`)
    products.value = data.products || []
    categoryName.value = data.category?.name || 'Category'
    totalPages.value = data.totalPages || 1
  } catch (err: any) {
    error.value = err.message || 'Failed to load products'
  } finally {
    loading.value = false
  }
}

function goToProduct(id: string) {
  router.push(`/product/${id}`)
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchProducts()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchProducts()
  }
}

function goToPage(p: number) {
  currentPage.value = p
  fetchProducts()
}

onMounted(() => {
  fetchProducts()
})
</script>
