<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
    <!-- Header -->
    <div class="text-center mb-8 sm:mb-10">
      <span class="badge-pink mb-3 inline-block">Categories</span>
      <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{{ $t('category.title') }}</h1>
      <p class="text-sm text-[#666666] mt-1">Browse our curated skincare collections</p>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
      <div v-for="i in 8" :key="i" class="bg-white rounded-2xl p-5 sm:p-6 border border-[#F1E6EA] animate-pulse">
        <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-[#FFF4F7] rounded-xl sm:rounded-2xl mb-4"></div>
        <div class="h-4 w-24 mx-auto bg-[#FFF4F7] rounded mb-2"></div>
        <div class="h-3 w-16 mx-auto bg-[#FFF4F7] rounded"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20 animate-fade-in">
      <div class="w-16 h-16 mx-auto bg-[#FFF4F7] rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-[#FF7AA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p class="text-sm text-[#666666] mb-4">{{ error }}</p>
      <button @click="fetchCategories" class="px-5 py-2.5 bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-button">
        {{ $t('common.retry') }}
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="categories.length === 0" class="text-center py-20 animate-fade-in">
      <div class="w-20 h-20 mx-auto bg-[#FFF8FA] rounded-full flex items-center justify-center mb-4">
        <span class="text-4xl">🧴</span>
      </div>
      <h2 class="font-display text-lg font-bold text-[#1A1A1A] mb-1">{{ $t('category.noCategories') }}</h2>
      <p class="text-sm text-[#666666]">{{ $t('category.checkBack') }}</p>
    </div>

    <!-- Categories Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 animate-fade-in-up">
      <div
        v-for="cat in categories"
        :key="cat._id"
        @click="goToCategory(cat._id)"
        class="group bg-white rounded-2xl p-5 sm:p-6 border border-[#F1E6EA] hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1 text-center"
      >
        <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-[#FFF4F7] to-[#F8D7E3] rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
          <span class="text-2xl sm:text-3xl">{{ cat.icon }}</span>
        </div>
        <h3 class="font-display font-semibold text-sm sm:text-base text-[#1A1A1A] group-hover:text-[#FF7AA2] transition-colors">{{ cat.name }}</h3>
        <p class="text-xs text-[#C4A8B6] mt-1.5">{{ cat.productCount ?? 0 }} {{ $t('category.products') }}</p>
        <div class="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span class="text-xs text-[#FF7AA2] font-medium">Shop Now →</span>
        </div>
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
