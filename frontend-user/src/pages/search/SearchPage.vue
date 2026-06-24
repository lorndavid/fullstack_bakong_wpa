<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
    <!-- Search Bar -->
    <div class="relative">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input
        v-model="searchQuery"
        @input="debouncedSearch"
        type="text"
        :placeholder="$t('search.placeholder')"
        class="w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-600 text-surface-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm shadow-sm"
        autofocus
      />
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-2 xs:gap-3 overflow-x-auto pb-1 scrollbar-hide">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="selectedFilter = filter.value; fetchProducts()"
        class="px-3.5 py-1.5 xs:px-4 xs:py-2 rounded-full text-xs xs:text-sm font-medium whitespace-nowrap transition-all"
        :class="selectedFilter === filter.value
          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
          : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-600 hover:border-primary-300 hover:text-primary-600'"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <div v-for="i in 8" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden animate-pulse">
        <div class="aspect-square bg-surface-200 dark:bg-surface-700"></div>
        <div class="p-3 space-y-2">
          <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4"></div>
          <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16 bg-white dark:bg-surface-800 rounded-2xl shadow-card">
      <p class="text-red-500 text-sm">{{ error }}</p>
      <button @click="fetchProducts" class="mt-3 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="products.length === 0" class="text-center py-16 bg-white dark:bg-surface-800 rounded-2xl shadow-card">
      <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <p class="text-surface-500 text-sm">{{ searchQuery ? $t('common.noResults') : $t('common.noData') }}</p>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      <div
        v-for="product in products"
        :key="product._id"
        @click="goToProduct(product._id)"
        class="group bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden cursor-pointer hover:-translate-y-1 border border-surface-100 dark:border-surface-700"
      >
        <div class="relative overflow-hidden">
          <img
            v-if="product.images && product.images.length > 0"
            :src="product.images[0].secure_url"
            :alt="product.name"
            class="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div v-else class="aspect-square bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
            <svg class="w-12 h-12 text-surface-300 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <!-- Discount Badge -->
          <span v-if="product.discount > 0" class="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">-{{ product.discount }}%</span>
          <!-- Promotion Badge -->
          <span
            v-if="!product.discount && getProductPromotion(product)"
            class="absolute top-2 right-2 px-2 py-0.5 bg-accent-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            Promo
          </span>
          <!-- Promotion + Discount Badge -->
          <span
            v-if="product.discount > 0 && getProductPromotion(product)"
            class="absolute top-2 right-2 px-2 py-0.5 bg-accent-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            Promo
          </span>
        <div class="p-3 space-y-1">
          <h3 class="text-sm font-semibold text-surface-800 dark:text-white truncate">{{ product.name }}</h3>
          <div class="flex items-center gap-2">
            <span v-if="product.discount > 0" class="text-base font-bold text-accent-500">${{ discountPrice(product).toFixed(2) }}</span>
            <span v-if="product.discount > 0" class="text-xs text-surface-400 line-through">${{ product.price.toFixed(2) }}</span>
            <span v-else class="text-base font-bold text-primary-500">${{ product.price.toFixed(2) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex">
              <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-surface-300'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <span class="text-xs text-surface-400">({{ product.numReviews }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="flex items-center justify-center gap-2">
      <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1"
        class="px-3 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        {{ $t('common.previous') }}
      </button>
      <button
        v-for="p in pagination.pages"
        :key="p"
        @click="goToPage(p)"
        class="w-8 h-8 text-sm rounded-lg transition-colors font-medium"
        :class="p === pagination.page ? 'bg-primary-500 text-white shadow-sm' : 'border border-surface-200 dark:border-surface-600 text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700'"
      >
        {{ p }}
      </button>
      <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page >= pagination.pages"
        class="px-3 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        {{ $t('common.next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

interface Product {
  _id: string
  name: string
  description: string
  price: number
  stock: number
  discount: number
  images: { public_id: string; secure_url: string }[]
  category: { _id: string; name: string; icon: string } | string
  rating: number
  numReviews: number
  sold: number
  featured: boolean
  createdAt: string
}

interface Promotion {
  _id: string
  name: string
  description: string
  discountPercent: number
  selectedProducts: string[]
  selectedCategories: string[]
  applyToAll: boolean
  startDate: string
  endDate: string
  bannerImage?: { public_id: string; secure_url: string }
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedFilter = ref('all')
const pagination = ref<Pagination>({ page: 1, limit: 12, total: 0, pages: 0 })
const activePromotions = ref<Promotion[]>([])

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const filters = computed(() => [
  { label: t('search.all'), value: 'all' },
  { label: t('search.sortLatest'), value: 'newest' },
  { label: t('search.sortLowHigh'), value: 'price_asc' },
  { label: t('search.sortHighLow'), value: 'price_desc' },
  { label: t('search.sortBestSelling'), value: 'best_seller' },
])

function discountPrice(product: Product): number {
  if (product.discount > 0) {
    return product.price * (1 - product.discount / 100)
  }
  return product.price
}

function goToProduct(id: string) {
  router.push(`/product/${id}`)
}

function getProductPromotion(product: Product): Promotion | null {
  if (!activePromotions.value.length) return null
  const catId = typeof product.category === 'object' ? product.category._id : product.category
  for (const promo of activePromotions.value) {
    if (promo.applyToAll) return promo
    if (promo.selectedProducts?.includes(product._id)) return promo
    if (catId && promo.selectedCategories?.includes(catId)) return promo
  }
  return null
}

async function fetchActivePromotions() {
  try {
    const data: any = await api.get('/promotions/active')
    activePromotions.value = data.promotions || []
  } catch {}
}

onMounted(async () => {
  // Get search query from URL params (e.g., when navigated from Shop Now)
  if (route.query.q) {
    searchQuery.value = route.query.q as string
  }
  await Promise.all([fetchProducts(), fetchActivePromotions()])
})

async function fetchProducts() {
  loading.value = true
  error.value = null
  try {
    const params: Record<string, any> = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    if (selectedFilter.value !== 'all') {
      params.sort = selectedFilter.value
    }

    const data: any = await api.get('/products', { params })
    products.value = data.products || []
    pagination.value = data.pagination || { page: 1, limit: 12, total: 0, pages: 0 }
  } catch (err: any) {
    error.value = err.message || 'Failed to load products'
  } finally {
    loading.value = false
  }
}

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    fetchProducts()
  }, 400)
}

function goToPage(page: number) {
  if (page < 1 || page > pagination.value.pages) return
  pagination.value.page = page
  fetchProducts()
}
</script>
