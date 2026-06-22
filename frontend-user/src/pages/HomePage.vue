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

      <!-- Skeleton -->
      <div v-if="loading" class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        <div v-for="i in 8" :key="i" class="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-surface-800 rounded-xl shadow-card animate-pulse">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-surface-200 dark:bg-surface-700 rounded-full"></div>
          <div class="h-3 w-16 bg-surface-200 dark:bg-surface-700 rounded"></div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="categoriesError" class="text-center py-4">
        <p class="text-sm text-surface-500">{{ categoriesError }}</p>
      </div>

      <!-- Categories Grid -->
      <div v-else class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        <div
          v-for="cat in categories"
          :key="cat._id"
          @click="goToCategory(cat._id)"
          class="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-surface-800 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-250 cursor-pointer hover:-translate-y-0.5"
        >
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-primary-50 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-xl sm:text-2xl">
            {{ cat.icon }}
          </div>
          <span class="text-xs text-surface-600 dark:text-surface-300 font-medium text-center truncate w-full">{{ cat.name }}</span>
        </div>
      </div>
    </section>

    <!-- Flash Sale -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <h2 class="text-lg sm:text-xl font-bold text-surface-800 dark:text-white">Flash Sale</h2>
          <div class="flex items-center space-x-1.5">
            <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">{{ flashTimer.hours }}</span>
            <span class="text-surface-400 font-bold">:</span>
            <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">{{ flashTimer.minutes }}</span>
            <span class="text-surface-400 font-bold">:</span>
            <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">{{ flashTimer.seconds }}</span>
          </div>
        </div>
        <router-link to="/search?sort=discount" class="text-sm text-primary-500 hover:text-primary-600 font-medium">View All</router-link>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        <div v-for="i in 4" :key="i" class="bg-white dark:bg-surface-800 rounded-card shadow-card overflow-hidden animate-pulse">
          <div class="aspect-square bg-surface-200 dark:bg-surface-700"></div>
          <div class="p-3 space-y-2">
            <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4"></div>
            <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Flash Sale Grid -->
      <div v-else-if="flashSaleProducts.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        <div
          v-for="product in flashSaleProducts"
          :key="product._id"
          @click="goToProduct(product._id)"
          class="group bg-white dark:bg-surface-800 rounded-card shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden cursor-pointer hover:-translate-y-1"
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
            <span class="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">-{{ product.discount }}%</span>
          </div>
          <div class="p-3">
            <h3 class="text-sm font-semibold text-surface-800 dark:text-white truncate">{{ product.name }}</h3>
            <div class="flex items-center space-x-2 mt-1">
              <span class="text-base font-bold text-accent-500">${{ discountPrice(product).toFixed(2) }}</span>
              <span class="text-xs text-surface-400 line-through">${{ product.price.toFixed(2) }}</span>
            </div>
            <div class="flex items-center justify-between mt-1">
              <div class="flex items-center">
                <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-surface-300'" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <span class="text-xs text-surface-400">{{ product.sold }} sold</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="flashError" class="text-center py-8 bg-white dark:bg-surface-800 rounded-2xl">
        <p class="text-sm text-red-500">{{ flashError }}</p>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-8 bg-white dark:bg-surface-800 rounded-2xl">
        <p class="text-sm text-surface-500">No flash sale items available</p>
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

      <!-- Skeleton -->
      <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <div v-for="i in 5" :key="i" class="bg-white dark:bg-surface-800 rounded-card shadow-card overflow-hidden animate-pulse">
          <div class="aspect-square bg-surface-200 dark:bg-surface-700"></div>
          <div class="p-3 space-y-2">
            <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4"></div>
            <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- New Arrivals Grid -->
      <div v-else-if="newArrivals.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <div
          v-for="product in newArrivals"
          :key="product._id"
          @click="goToProduct(product._id)"
          class="group bg-white dark:bg-surface-800 rounded-card shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden cursor-pointer hover:-translate-y-1"
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
            <span v-if="product.discount > 0" class="absolute top-2 left-2 px-2 py-0.5 bg-accent-500 text-white text-xs font-bold rounded">NEW</span>
          </div>
          <div class="p-3">
            <h3 class="text-sm font-semibold text-surface-800 dark:text-white truncate">{{ product.name }}</h3>
            <div class="flex items-center space-x-1 mt-1">
              <span class="text-base font-bold text-primary-500">
                {{ product.discount > 0 ? '$' + discountPrice(product).toFixed(2) : '$' + product.price.toFixed(2) }}
              </span>
            </div>
            <div class="flex items-center space-x-1 mt-1">
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

      <!-- Error -->
      <div v-else-if="arrivalsError" class="text-center py-8 bg-white dark:bg-surface-800 rounded-2xl">
        <p class="text-sm text-red-500">{{ arrivalsError }}</p>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-8 bg-white dark:bg-surface-800 rounded-2xl">
        <p class="text-sm text-surface-500">No new arrivals yet</p>
      </div>
    </section>

    <!-- Bottom spacing -->
    <div class="h-4"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

interface Category {
  _id: string
  name: string
  icon: string
}

interface Product {
  _id: string
  name: string
  description: string
  price: number
  stock: number
  discount: number
  images: { public_id: string; secure_url: string }[]
  category: Category | string
  rating: number
  numReviews: number
  sold: number
  featured: boolean
  createdAt: string
}

const router = useRouter()

// State
const categories = ref<Category[]>([])
const flashSaleProducts = ref<Product[]>([])
const newArrivals = ref<Product[]>([])
const loading = ref(true)
const categoriesError = ref<string | null>(null)
const flashError = ref<string | null>(null)
const arrivalsError = ref<string | null>(null)

// Flash sale countdown timer (24h from mount)
const FLASH_SALE_DURATION = 24 * 60 * 60 // 24 hours in seconds
const flashRemaining = ref(FLASH_SALE_DURATION)
let timerInterval: ReturnType<typeof setInterval> | null = null

const flashTimer = computed(() => {
  const h = Math.floor(flashRemaining.value / 3600)
  const m = Math.floor((flashRemaining.value % 3600) / 60)
  const s = flashRemaining.value % 60
  return {
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0'),
  }
})

function discountPrice(product: Product): number {
  if (product.discount > 0) {
    return product.price * (1 - product.discount / 100)
  }
  return product.price
}

function goToProduct(id: string) {
  router.push(`/product/${id}`)
}

function goToCategory(id: string) {
  router.push(`/category/${id}`)
}

async function fetchCategories() {
  try {
    const data: any = await api.get('/categories')
    categories.value = data.categories || []
  } catch (err: any) {
    categoriesError.value = 'Failed to load categories'
    console.error('Failed to fetch categories:', err)
  }
}

async function fetchFlashSale() {
  try {
    const data: any = await api.get('/products/flash-sale')
    flashSaleProducts.value = data.products || []
  } catch (err: any) {
    flashError.value = 'Failed to load flash sale'
    console.error('Failed to fetch flash sale:', err)
  }
}

async function fetchNewArrivals() {
  try {
    const data: any = await api.get('/products/new-arrivals')
    newArrivals.value = data.products || []
  } catch (err: any) {
    arrivalsError.value = 'Failed to load new arrivals'
    console.error('Failed to fetch new arrivals:', err)
  }
}

onMounted(async () => {
  loading.value = true

  // Fetch all data in parallel
  await Promise.all([
    fetchCategories(),
    fetchFlashSale(),
    fetchNewArrivals(),
  ])

  loading.value = false

  // Start flash sale countdown
  timerInterval = setInterval(() => {
    if (flashRemaining.value > 0) {
      flashRemaining.value--
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
})
</script>
