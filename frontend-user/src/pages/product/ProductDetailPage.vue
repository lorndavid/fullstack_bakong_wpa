<template>
  <div class="bg-white min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-8">
        <div class="h-4 w-48 shimmer-bg rounded-lg"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div class="aspect-square shimmer-bg rounded-3xl"></div>
          <div class="space-y-5">
            <div class="h-8 w-3/4 shimmer-bg rounded-lg"></div>
            <div class="h-6 w-1/3 shimmer-bg rounded-lg"></div>
            <div class="h-12 w-1/2 shimmer-bg rounded-lg"></div>
            <div class="h-14 w-full shimmer-bg rounded-xl"></div>
            <div class="h-14 w-full shimmer-bg rounded-xl"></div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20">
        <span class="text-6xl mb-6 block">😔</span>
        <h2 class="text-2xl font-display font-bold text-[#1A1A1A] mb-2">{{ $t('product.notFound') }}</h2>
        <p class="text-[#666666] mb-6">{{ error }}</p>
        <router-link to="/" class="btn-primary">Back to Home</router-link>
      </div>

      <template v-else-if="product">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-[#C4A8B6] mb-6 overflow-x-auto scrollbar-hide">
          <router-link to="/" class="hover:text-[#FF7AA2] transition-colors flex-shrink-0">Home</router-link>
          <span>/</span>
          <router-link v-if="categoryName" :to="`/category/${categoryId}`" class="hover:text-[#FF7AA2] transition-colors flex-shrink-0">{{ categoryName }}</router-link>
          <span v-if="categoryName">/</span>
          <span class="text-[#1A1A1A] font-medium truncate flex-shrink-0">{{ product.name }}</span>
        </nav>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <!-- ═══ Image Gallery ═══ -->
          <div class="space-y-4 md:sticky md:top-24 md:self-start">
            <div class="relative aspect-square bg-[#FFF8FA] rounded-3xl overflow-hidden group border border-[#F1E6EA]">
              <img v-if="selectedImage" :src="selectedImage" :alt="product.name"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-6xl">✨</span>
              </div>
              <!-- Discount Badge -->
              <div v-if="product.discount > 0" class="absolute top-4 left-4 px-3 py-1.5 bg-[#FF7AA2] text-white text-sm font-bold rounded-full shadow-lg">
                -{{ product.discount }}%
              </div>
            </div>
            <!-- Thumbnails -->
            <div v-if="product.images && product.images.length > 1" class="grid grid-cols-4 gap-3">
              <div v-for="(img, idx) in product.images" :key="idx"
                @click="selectedImageIndex = idx"
                class="aspect-square bg-[#FFF8FA] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2"
                :class="idx === selectedImageIndex ? 'border-[#FF7AA2] shadow-pink' : 'border-[#F1E6EA] hover:border-[#FF7AA2]/50'">
                <img :src="img.secure_url" :alt="`${product.name} ${idx + 1}`" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <!-- ═══ Product Info ═══ -->
          <div class="space-y-6">
            <div>
              <span v-if="categoryName" class="badge-pink mb-3 inline-block">{{ categoryName }}</span>
              <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-tight">{{ product.name }}</h1>
            </div>

            <!-- Rating -->
            <div class="flex items-center gap-3">
              <div class="flex items-center">
                <svg v-for="s in 5" :key="s" class="w-4 h-4" :class="s <= Math.round(product.rating) ? 'text-amber-400' : 'text-[#F1E6EA]'" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <span class="text-sm text-[#666666]">{{ product.rating.toFixed(1) }} ({{ product.numReviews }} reviews)</span>
              <span class="text-[#F1E6EA]">|</span>
              <span class="text-sm text-[#666666]">{{ product.sold }} sold</span>
            </div>

            <!-- Price -->
            <div class="flex items-baseline gap-3 pb-6 border-b border-[#F1E6EA]">
              <span class="text-price-lg sm:text-4xl font-bold text-[#1A1A1A]">${{ displayPrice.toFixed(2) }}</span>
              <span v-if="product.discount > 0" class="text-lg text-[#C4A8B6] line-through">${{ product.price.toFixed(2) }}</span>
              <span v-if="product.discount > 0" class="px-2.5 py-1 bg-[#FF7AA2]/10 text-[#FF7AA2] text-xs font-bold rounded-full">Save {{ product.discount }}%</span>
            </div>

            <!-- Benefits Badges -->
            <div class="flex flex-wrap gap-2">
              <span class="badge-success">✨ Dermatologist Approved</span>
              <span class="badge-pink">🌱 Clean Ingredients</span>
              <span class="badge-pink">🧪 Cruelty Free</span>
            </div>

            <!-- Description -->
            <p class="text-body text-[#666666] leading-relaxed">{{ product.description }}</p>

            <!-- Stock Status -->
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full" :class="product.stock > 0 ? 'bg-[#34C759]' : 'bg-red-500'"></div>
              <span class="text-sm font-medium" :class="product.stock > 0 ? 'text-[#34C759]' : 'text-red-500'">
                {{ product.stock > 0 ? (product.stock <= 10 ? `Only ${product.stock} left in stock` : 'In Stock') : 'Out of Stock' }}
              </span>
            </div>

            <!-- Quantity & Add to Cart -->
            <div v-if="product.stock > 0" class="space-y-4">
              <div class="flex items-center gap-4">
                <span class="text-sm font-medium text-[#1A1A1A]">Quantity</span>
                <div class="flex items-center bg-[#FFF8FA] rounded-xl border border-[#F1E6EA] p-1">
                  <button @click="decrement" :disabled="quantity <= 1"
                    class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-[#666666] disabled:opacity-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                  </button>
                  <span class="w-12 text-center font-semibold text-[#1A1A1A]">{{ quantity }}</span>
                  <button @click="increment" :disabled="quantity >= product.stock"
                    class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-[#666666] disabled:opacity-50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
              </div>

              <button @click="addToCart" class="w-full btn-primary !py-4 text-base">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                Add to Cart — ${{ displayPrice.toFixed(2) }}
              </button>
            </div>

            <div v-else class="p-5 bg-red-50 rounded-2xl text-center">
              <p class="text-red-500 font-medium">Currently out of stock</p>
            </div>

            <!-- Shipping Info -->
            <div class="grid grid-cols-2 gap-3 p-5 bg-[#FFF8FA] rounded-2xl border border-[#F1E6EA]">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-[#34C759]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-[#1A1A1A]">Free Shipping</p>
                  <p class="text-xs text-[#666666]">On all orders</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-[#34C759]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-[#1A1A1A]">30-Day Returns</p>
                  <p class="text-xs text-[#666666]">Hassle free</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ Related Products ═══ -->
        <section v-if="relatedProducts.length > 0" class="mt-16 sm:mt-20">
          <div class="text-center mb-8">
            <span class="badge-pink mb-3 inline-block">You May Also Like</span>
            <h2 class="font-display text-2xl font-bold text-[#1A1A1A]">Complete Your Routine</h2>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div v-for="rp in relatedProducts" :key="rp._id"
              @click="goToProduct(rp._id)" class="product-card cursor-pointer">
              <div class="product-image aspect-square bg-[#FFF8FA] overflow-hidden">
                <img v-if="rp.images?.[0]" :src="rp.images[0].secure_url" :alt="rp.name" class="w-full h-full object-cover" loading="lazy" />
                <div v-else class="w-full h-full flex items-center justify-center"><span class="text-4xl">✨</span></div>
              </div>
              <div class="p-4">
                <h3 class="font-display font-semibold text-sm text-[#1A1A1A] truncate">{{ rp.name }}</h3>
                <span class="font-bold text-base text-[#1A1A1A]">${{ rp.price.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>

    <!-- Floating Add to Cart (Mobile) -->
    <div v-if="product && product.stock > 0"
      class="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#F1E6EA] p-4 animate-slide-up md:hidden">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <p class="text-sm text-[#666666]">{{ product.name }}</p>
          <p class="text-lg font-bold text-[#1A1A1A]">${{ displayPrice.toFixed(2) }}</p>
        </div>
        <button @click="addToCart" class="btn-primary !py-3 !px-6">
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const toast = useToast()

interface Product { _id: string; name: string; description: string; price: number; stock: number; discount: number; images: { secure_url: string }[]; category: any; rating: number; numReviews: number; sold: number }

const product = ref<Product | null>(null)
const relatedProducts = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const quantity = ref(1)
const selectedImageIndex = ref(0)

const categoryName = computed(() => { const c = product.value?.category; return c && typeof c === 'object' ? c.name : '' })
const categoryId = computed(() => { const c = product.value?.category; return c && typeof c === 'object' ? c._id : (c || '') })
const selectedImage = computed(() => product.value?.images?.length ? product.value.images[selectedImageIndex.value]?.secure_url || product.value.images[0]?.secure_url : '')
const displayPrice = computed(() => product.value ? (product.value.discount > 0 ? product.value.price * (1 - product.value.discount / 100) : product.value.price) : 0)

onMounted(async () => {
  const id = route.params.id as string
  if (!id) { error.value = 'Invalid product ID'; loading.value = false; return }
  try {
    const [prodData, relData] = await Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/related`),
    ])
    product.value = (prodData as any).product || null
    relatedProducts.value = (relData as any).products || []
    if (!product.value) error.value = 'Product not found'
  } catch (err: any) { error.value = err.message || 'Failed to load product' }
  finally { loading.value = false }
})

function goToProduct(id: string) { router.push(`/product/${id}`) }
function increment() { if (product.value) quantity.value = Math.min(quantity.value + 1, product.value.stock) }
function decrement() { quantity.value = Math.max(quantity.value - 1, 1) }
function addToCart() {
  if (!product.value) return
  cart.addItem(product.value, quantity.value)
  toast.success(t('product.addedToCart'))
}
</script>
