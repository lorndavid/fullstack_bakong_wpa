<template>
  <article
    class="group relative flex flex-col bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700/60 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden cursor-pointer hover:-translate-y-1"
    @click="goToProduct"
  >
    <!-- Image -->
    <div class="relative aspect-square overflow-hidden bg-surface-100 dark:bg-surface-700">
      <img
        v-if="image"
        :src="image"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="w-12 h-12 text-surface-300 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>

      <!-- Badges (top-left) -->
      <div class="absolute top-2 left-2 flex flex-col gap-1.5 items-start">
        <span v-if="product.discount > 0" class="badge-sale shadow-sm backdrop-blur-sm">-{{ product.discount }}%</span>
        <span v-if="badge" class="badge-new shadow-sm backdrop-blur-sm">{{ badge }}</span>
      </div>

      <!-- Wishlist (top-right) -->
      <button
        type="button"
        @click.stop="toggleWishlist"
        class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-surface-500 hover:text-danger transition-all active:scale-90"
        :aria-label="isWished ? 'Remove from wishlist' : 'Add to wishlist'"
      >
        <svg class="w-4 h-4" :class="isWished ? 'text-danger' : ''" :fill="isWished ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </button>

      <!-- Out of stock overlay -->
      <div v-if="product.stock <= 0" class="absolute inset-0 bg-white/60 dark:bg-surface-900/60 backdrop-blur-[1px] flex items-center justify-center">
        <span class="px-3 py-1 bg-surface-900/80 text-white text-xs font-semibold rounded-full">Out of Stock</span>
      </div>

      <!-- Quick add (desktop hover) -->
      <button
        v-if="product.stock > 0"
        type="button"
        @click.stop="addToCart"
        class="absolute bottom-2 left-2 right-2 h-9 hidden sm:flex items-center justify-center gap-1.5 rounded-xl bg-primary-500 text-white text-sm font-semibold shadow-primary opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:bg-primary-600"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
        </svg>
        {{ $t('product.addToCart') }}
      </button>
    </div>

    <!-- Info -->
    <div class="flex flex-col flex-1 p-3">
      <!-- Rating -->
      <div class="flex items-center gap-1 mb-1">
        <div class="flex">
          <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= Math.round(product.rating) ? 'text-amber-400' : 'text-surface-200 dark:text-surface-600'" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
        <span class="text-[11px] text-surface-400">({{ product.numReviews ?? 0 }})</span>
      </div>

      <!-- Name -->
      <h3 class="text-sm font-semibold text-surface-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
        {{ product.name }}
      </h3>

      <!-- Price -->
      <div class="mt-auto pt-2 flex items-end justify-between gap-2">
        <div class="flex items-baseline gap-1.5 flex-wrap">
          <span class="text-base font-bold text-surface-900 dark:text-white">${{ finalPrice.toFixed(2) }}</span>
          <span v-if="product.discount > 0" class="text-xs text-surface-400 line-through">${{ product.price.toFixed(2) }}</span>
        </div>
        <!-- Mobile add button -->
        <button
          v-if="product.stock > 0"
          type="button"
          @click.stop="addToCart"
          class="sm:hidden w-8 h-8 flex-shrink-0 rounded-lg bg-primary-500 text-white flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Add to cart"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'

interface ProductImage { public_id?: string; secure_url: string }
interface Product {
  _id: string
  name: string
  price: number
  discount: number
  stock: number
  images: ProductImage[]
  rating: number
  numReviews?: number
  sold?: number
  category?: { _id: string } | string
}

const props = defineProps<{
  product: Product
  badge?: string
}>()

const router = useRouter()
const cart = useCartStore()
const toast = useToast()

const WISHLIST_KEY = 'wishlist'
const isWished = ref(getWishlist().includes(props.product._id))

const image = computed(() => props.product.images?.[0]?.secure_url || '')

const finalPrice = computed(() =>
  props.product.discount > 0
    ? props.product.price * (1 - props.product.discount / 100)
    : props.product.price
)

function goToProduct() {
  router.push(`/product/${props.product._id}`)
}

function addToCart() {
  if (props.product.stock <= 0) return
  cart.addItem(props.product as any, 1)
  toast.success(`${props.product.name} added to cart`)
}

function getWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]')
  } catch {
    return []
  }
}

function toggleWishlist() {
  const list = getWishlist()
  const idx = list.indexOf(props.product._id)
  if (idx >= 0) {
    list.splice(idx, 1)
    isWished.value = false
    toast.info('Removed from wishlist')
  } else {
    list.push(props.product._id)
    isWished.value = true
    toast.success('Added to wishlist')
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list))
}
</script>
