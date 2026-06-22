<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
    <!-- Breadcrumb -->
    <nav class="flex items-center space-x-2 text-sm text-surface-500 dark:text-surface-400">
      <router-link to="/" class="hover:text-primary-500">Home</router-link>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      <span class="text-surface-800 dark:text-white">Product</span>
    </nav>

    <!-- Product Main -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      <!-- Image Gallery -->
      <div class="space-y-3">
        <div class="relative aspect-square bg-surface-100 dark:bg-surface-700 rounded-2xl overflow-hidden group">
          <div class="w-full h-full bg-surface-100 dark:bg-surface-700 animate-pulse"></div>
          <!-- Zoom lens placeholder -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="absolute top-4 right-4 bg-white/90 dark:bg-surface-800/90 p-2 rounded-lg backdrop-blur-sm">
              <svg class="w-5 h-5 text-surface-600 dark:text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <div v-for="i in 4" :key="i" 
            class="aspect-square bg-surface-100 dark:bg-surface-700 rounded-xl cursor-pointer transition-all duration-150"
            :class="i === 1 ? 'ring-2 ring-primary-500' : 'opacity-60 hover:opacity-100'"
          ></div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="space-y-4 sm:space-y-5">
        <div>
          <span class="inline-block px-3 py-1 bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full">Category</span>
        </div>
        
        <h1 class="text-2xl sm:text-3xl font-bold text-surface-800 dark:text-white leading-tight">
          Product Name
        </h1>

        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <div class="flex">
              <svg v-for="s in 5" :key="s" class="w-4 h-4" :class="s <= 4 ? 'text-yellow-400' : 'text-surface-300 dark:text-surface-600'" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            </div>
            <span class="ml-1.5 text-sm text-surface-500">(4.0)</span>
          </div>
          <span class="text-sm text-surface-400">|</span>
          <span class="text-sm text-surface-500">{{ 128 }} sold</span>
        </div>

        <!-- Price -->
        <div class="flex items-baseline space-x-3">
          <span class="text-3xl sm:text-4xl font-bold text-accent-500">$19.99</span>
          <span class="text-lg text-surface-400 line-through">$29.99</span>
          <span class="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">-33%</span>
        </div>

        <!-- Quantity -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-surface-700 dark:text-surface-200">Quantity</label>
          <div class="flex items-center space-x-3">
            <button @click="decrement" class="w-10 h-10 flex items-center justify-center border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors text-surface-600 dark:text-surface-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
            </button>
            <span class="w-12 text-center font-semibold text-surface-800 dark:text-white">{{ quantity }}</span>
            <button @click="increment" class="w-10 h-10 flex items-center justify-center border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors text-surface-600 dark:text-surface-300">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button @click="addToCart" class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all focus:ring-4 focus:ring-primary-500/30">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
            Add to Cart
          </button>
          <button class="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            Wishlist
          </button>
        </div>

        <!-- Shipping Info -->
        <div class="grid grid-cols-2 gap-3 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
            <span class="text-sm text-surface-600 dark:text-surface-300">Free shipping over $50</span>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="text-sm text-surface-600 dark:text-surface-300">30-day returns</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Description & Reviews -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
          <h2 class="text-lg font-bold text-surface-800 dark:text-white mb-3">Description</h2>
          <p class="text-surface-600 dark:text-surface-300 text-sm leading-relaxed">
            Product description goes here. This is a high-quality product with premium features.
          </p>
        </div>
      </div>
      <div class="space-y-4">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
          <h2 class="text-lg font-bold text-surface-800 dark:text-white mb-3">Reviews</h2>
          <div class="text-center text-surface-400 py-4">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <p class="text-sm">No reviews yet</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <section>
      <h2 class="text-lg sm:text-xl font-bold text-surface-800 dark:text-white mb-4">Related Products</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        <div v-for="i in 4" :key="i" class="group bg-white dark:bg-surface-800 rounded-card shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden cursor-pointer hover:-translate-y-1">
          <div class="aspect-square bg-surface-100 dark:bg-surface-700 animate-pulse"></div>
          <div class="p-3">
            <h3 class="text-sm font-semibold text-surface-800 dark:text-white truncate">Related Product</h3>
            <span class="text-sm font-bold text-primary-500">$19.99</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'

const cart = useCartStore()
const toast = useToast()
const quantity = ref(1)

function increment() {
  quantity.value = Math.min(quantity.value + 1, 99)
}
function decrement() {
  quantity.value = Math.max(quantity.value - 1, 1)
}
function addToCart() {
  toast.success('Added to cart!')
}
</script>
