<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
    <!-- Search Bar -->
    <div class="relative mb-6">
      <div class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C4A8B6]">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="$t('search.placeholder')"
        class="w-full pl-12 pr-12 py-3.5 bg-[#FFF8FA] border border-[#F1E6EA] text-[#1A1A1A] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF7AA2]/20 focus:border-[#FF7AA2] text-sm placeholder:text-[#C4A8B6] transition-all duration-200"
        autofocus
      />
      <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#C4A8B6] hover:text-[#FF7AA2] transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      <button v-for="filter in filters" :key="filter.value" @click="selectedFilter = filter.value"
        class="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200"
        :class="selectedFilter === filter.value 
          ? 'bg-[#FF7AA2] text-white shadow-soft' 
          : 'bg-white text-[#666666] border border-[#F1E6EA] hover:border-[#FF7AA2] hover:text-[#FF7AA2]'"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Search Results -->
    <div v-if="searchQuery && searchResults.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 animate-fade-in-up">
      <div v-for="product in searchResults" :key="product._id"
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
          <h3 class="font-display font-semibold text-sm text-[#1A1A1A] truncate group-hover:text-[#FF7AA2] transition-colors">
            {{ product.name }}
          </h3>
          <div class="flex items-center mt-1.5">
            <div class="flex items-center gap-0.5">
              <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= Math.round(product.rating || 4) ? 'text-amber-400' : 'text-[#F1E6EA]'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <span class="text-xs text-[#C4A8B6] ml-1.5">({{ product.numReviews || 0 }})</span>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <span class="font-bold text-base text-[#1A1A1A]">${{ product.discount > 0 ? (product.price * (1 - product.discount / 100)).toFixed(2) : product.price.toFixed(2) }}</span>
            <span v-if="product.discount > 0" class="text-xs text-[#C4A8B6] line-through">${{ product.price.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty / Placeholder -->
    <div v-else class="text-center py-20 animate-fade-in">
      <div class="w-20 h-20 mx-auto bg-[#FFF8FA] rounded-full flex items-center justify-center mb-5">
        <svg class="w-10 h-10 text-[#F1E6EA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
      <h3 class="font-display font-semibold text-lg text-[#1A1A1A] mb-1">
        {{ searchQuery ? 'No results found' : 'Search our collection' }}
      </h3>
      <p class="text-sm text-[#666666] max-w-xs mx-auto">
        {{ searchQuery ? 'Try adjusting your search or filter criteria' : 'Find your perfect skincare products by name, category, or ingredients' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'

const { t } = useI18n()
const router = useRouter()
const searchQuery = ref('')
const selectedFilter = ref('all')
const searchResults = ref<any[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

const filters = computed(() => [
  { label: t('search.all'), value: 'all' },
  { label: t('search.sortLatest'), value: 'latest' },
  { label: t('search.sortLowHigh'), value: 'lowhigh' },
  { label: t('search.sortHighLow'), value: 'highlow' },
  { label: t('search.sortBestSelling'), value: 'bestselling' },
])

watch(searchQuery, (val) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (val.length < 2) {
    searchResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    try {
      const data: any = await api.get(`/products?search=${encodeURIComponent(val)}&limit=12`)
      searchResults.value = data.products || []
    } catch { searchResults.value = [] }
  }, 300)
})

function goToProduct(id: string) { router.push(`/product/${id}`) }
</script>
