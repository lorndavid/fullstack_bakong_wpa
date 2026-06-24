<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-1.5 text-xs sm:text-sm text-[#C4A8B6] mb-4 overflow-x-auto scrollbar-hide whitespace-nowrap">
      <router-link to="/" class="hover:text-[#FF7AA2] transition-colors flex-shrink-0">Home</router-link>
      <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      <router-link to="/categories" class="hover:text-[#FF7AA2] transition-colors flex-shrink-0">{{ $t('nav.categories') }}</router-link>
      <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      <span class="text-[#1A1A1A] font-medium truncate max-w-[140px]">{{ categoryName }}</span>
    </nav>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div>
        <span class="badge-pink mb-2 inline-block">{{ $t('category.title') }}</span>
        <h1 class="font-display text-xl sm:text-2xl font-bold text-[#1A1A1A]">{{ categoryName }}</h1>
      </div>
      <div class="relative">
        <select v-model="sortBy" @change="fetchProducts"
          class="appearance-none w-full sm:w-auto px-4 py-2.5 bg-white border border-[#F1E6EA] text-[#1A1A1A] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7AA2]/20 focus:border-[#FF7AA2] pr-10 cursor-pointer">
          <option value="latest">{{ $t('search.sortLatest') }}</option>
          <option value="lowhigh">{{ $t('search.sortLowHigh') }}</option>
          <option value="highlow">{{ $t('search.sortHighLow') }}</option>
          <option value="bestselling">{{ $t('search.sortBestSelling') }}</option>
        </select>
        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A8B6] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
      <div v-for="i in 8" :key="i" class="bg-white rounded-2xl overflow-hidden border border-[#F1E6EA] animate-pulse">
        <div class="aspect-square bg-[#FFF4F7]"></div>
        <div class="p-4 space-y-2">
          <div class="h-4 bg-[#FFF4F7] rounded w-3/4"></div>
          <div class="h-4 bg-[#FFF4F7] rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20 animate-fade-in">
      <div class="w-16 h-16 mx-auto bg-[#FFF4F7] rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-[#FF7AA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <p class="text-sm text-[#666666] mb-4">{{ error }}</p>
      <button @click="fetchProducts" class="px-5 py-2.5 bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-button">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="products.length === 0" class="text-center py-20 animate-fade-in">
      <div class="w-20 h-20 mx-auto bg-[#FFF8FA] rounded-full flex items-center justify-center mb-4">
        <span class="text-4xl">🧴</span>
      </div>
      <p class="text-sm text-[#666666]">{{ $t('home.noNewArrivals') }}</p>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 animate-fade-in-up">
      <div v-for="product in products" :key="product._id"
        @click="goToProduct(product._id)"
        class="product-card cursor-pointer group">
        <div class="relative product-image aspect-square overflow-hidden bg-[#FFF8FA] rounded-t-2xl">
          <img v-if="product.images?.[0]" :src="product.images[0].secure_url" :alt="product.name"
            class="w-full h-full object-cover" loading="lazy" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="text-4xl">✨</span>
          </div>
          <div v-if="product.discount > 0" class="absolute top-3 left-3 px-2.5 py-1 bg-[#FF7AA2] text-white text-xs font-bold rounded-full shadow-sm">
            -{{ product.discount }}%
          </div>
        </div>
        <div class="p-3 sm:p-4">
          <h3 class="font-display font-semibold text-sm text-[#1A1A1A] truncate group-hover:text-[#FF7AA2] transition-colors">{{ product.name }}</h3>
          <div class="flex items-center mt-1.5">
            <div class="flex items-center gap-0.5">
              <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= Math.round(product.rating || 4) ? 'text-amber-400' : 'text-[#F1E6EA]'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <span class="text-xs text-[#C4A8B6] ml-1.5">({{ product.numReviews || 0 }})</span>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <span class="font-bold text-base text-[#1A1A1A]">${{ product.price.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-10 animate-fade-in">
      <button @click="prevPage" :disabled="currentPage <= 1"
        class="w-10 h-10 flex items-center justify-center border border-[#F1E6EA] rounded-xl text-[#666666] hover:bg-[#FFF8FA] hover:border-[#FF7AA2] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <button v-for="p in totalPages" :key="p" @click="goToPage(p)"
        class="w-10 h-10 rounded-xl text-sm font-medium transition-all"
        :class="p === currentPage ? 'bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] text-white shadow-soft' : 'border border-[#F1E6EA] text-[#666666] hover:bg-[#FFF8FA]'">
        {{ p }}
      </button>
      <button @click="nextPage" :disabled="currentPage >= totalPages"
        class="w-10 h-10 flex items-center justify-center border border-[#F1E6EA] rounded-xl text-[#666666] hover:bg-[#FFF8FA] hover:border-[#FF7AA2] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
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

function goToProduct(id: string) { router.push(`/product/${id}`) }
function prevPage() { if (currentPage.value > 1) { currentPage.value--; fetchProducts() } }
function nextPage() { if (currentPage.value < totalPages.value) { currentPage.value++; fetchProducts() } }
function goToPage(p: number) { currentPage.value = p; fetchProducts() }

onMounted(() => { fetchProducts() })
</script>

<style scoped>
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
.animate-fade-in { animation: fade-in 0.3s ease-out; }
</style>
