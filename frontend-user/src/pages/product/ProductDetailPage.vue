<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-6">
      <div class="h-4 w-48 bg-surface-200 dark:bg-surface-700 rounded animate-pulse"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <div class="aspect-square bg-surface-200 dark:bg-surface-700 rounded-2xl animate-pulse"></div>
        <div class="space-y-4">
          <div class="h-8 w-3/4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse"></div>
          <div class="h-6 w-1/3 bg-surface-200 dark:bg-surface-700 rounded animate-pulse"></div>
          <div class="h-12 w-1/2 bg-surface-200 dark:bg-surface-700 rounded animate-pulse"></div>
          <div class="h-10 w-full bg-surface-200 dark:bg-surface-700 rounded-lg animate-pulse"></div>
          <div class="h-10 w-full bg-surface-200 dark:bg-surface-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <svg class="w-20 h-20 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <h2 class="text-xl font-bold text-surface-700 dark:text-surface-200 mb-2">{{ $t('product.notFound') }}</h2>
      <p class="text-surface-500 mb-6">{{ error }}</p>
      <router-link to="/" class="inline-flex items-center px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
        {{ $t('common.backToHome') }}
      </router-link>
    </div>

    <template v-else-if="product">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-1.5 xs:space-x-2 text-xs xs:text-sm text-surface-500 dark:text-surface-400 overflow-x-auto scrollbar-hide whitespace-nowrap pb-1">
        <router-link to="/" class="hover:text-primary-500 flex-shrink-0">{{ $t('nav.home') }}</router-link>
        <svg class="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <router-link v-if="categoryName" :to="`/category/${categoryId}`" class="hover:text-primary-500 flex-shrink-0">{{ categoryName }}</router-link>
        <svg v-if="categoryName" class="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <span class="text-surface-800 dark:text-white font-medium truncate max-w-[120px] xs:max-w-[200px]">{{ product.name }}</span>
      </nav>

      <!-- Product Main -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <!-- Image Gallery -->
        <div class="space-y-3">
          <div class="relative aspect-square bg-surface-100 dark:bg-surface-700 rounded-2xl overflow-hidden group">
            <img
              v-if="product.images && product.images.length > 0"
              :src="selectedImage"
              :alt="product.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-24 h-24 text-surface-300 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <!-- Promotion Ribbon -->
            <div
              v-if="activePromotion"
              class="absolute top-0 right-0"
            >
              <div class="relative">
                <svg class="w-24 h-24" viewBox="0 0 96 96" fill="none">
                  <path d="M96 0L0 96H96V0Z" class="fill-accent-500/90"/>
                </svg>
                <div class="absolute top-2 right-2 flex flex-col items-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="text-[10px] font-bold text-white leading-tight mt-0.5">-{{ activePromotion.discountPercent }}%</span>
                </div>
              </div>
            </div>
            <!-- Discount Badge -->
            <div
              v-if="product.discount > 0"
              class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1"
            >
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              -{{ product.discount }}%
            </div>
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="absolute top-4 right-4 bg-white/90 dark:bg-surface-800/90 p-2 rounded-lg backdrop-blur-sm">
                <svg class="w-5 h-5 text-surface-600 dark:text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                </svg>
              </div>
            </div>
          </div>
          <div v-if="product.images && product.images.length > 1" class="grid grid-cols-4 gap-2">
            <div
              v-for="(img, idx) in product.images"
              :key="idx"
              @click="selectedImageIndex = idx"
              class="aspect-square bg-surface-100 dark:bg-surface-700 rounded-xl overflow-hidden cursor-pointer transition-all duration-150"
              :class="idx === selectedImageIndex ? 'ring-2 ring-primary-500' : 'opacity-60 hover:opacity-100'"
            >
              <img :src="img.secure_url" :alt="`${product.name} ${idx + 1}`" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-4 sm:space-y-5">
          <div>
            <span v-if="categoryName" class="inline-block px-3 py-1 bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full">
              {{ categoryName }}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-bold text-surface-800 dark:text-white leading-tight">
            {{ product.name }}
          </h1>

          <div class="flex items-center flex-wrap gap-y-1 space-x-4">
            <div class="flex items-center">
              <div class="flex">
                <svg v-for="s in 5" :key="s" class="w-4 h-4" :class="s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-surface-300 dark:text-surface-600'" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <span class="ml-1.5 text-sm text-surface-500">({{ product.numReviews }})</span>
            </div>
            <span class="text-sm text-surface-400">|</span>
            <span class="text-sm text-surface-500">{{ product.sold }} {{ $t('home.sold') }}</span>
          </div>

          <!-- Price -->
          <!-- Price -->
          <div class="flex items-baseline space-x-3">
            <span class="text-2xl xs:text-3xl sm:text-4xl font-bold" :class="displayPrice < product.price ? 'text-accent-500' : 'text-primary-500'">
              ${{ displayPrice.toFixed(2) }}
            </span>
            <span v-if="displayPrice < product.price" class="text-lg text-surface-400 line-through">${{ product.price.toFixed(2) }}</span>
            <span v-if="product.discount > 0" class="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">-{{ product.discount }}%</span>
          </div>
          <!-- Promotion Banner -->
          <div
            v-if="activePromotion"
            class="p-3 bg-gradient-to-r from-accent-500/10 to-accent-400/5 dark:from-accent-500/20 dark:to-accent-400/10 border border-accent-300 dark:border-accent-600 rounded-xl"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center shadow-sm">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm text-accent-700 dark:text-accent-300">
                  {{ activePromotion.name }}
                </p>
                <p class="text-xs text-accent-600/80 dark:text-accent-400/80 mt-0.5">
                  {{ activePromotion.description || $t('promotion.discount', { percent: activePromotion.discountPercent }) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Stock Status -->
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 rounded-full" :class="product.stock > 0 ? 'bg-accent-500' : 'bg-red-500'"></div>
            <span class="text-sm text-surface-600 dark:text-surface-300">
              {{ product.stock > 0 ? (product.stock <= 10 ? $t('product.leftStock', { stock: product.stock }) : $t('product.inStock')) : $t('product.outOfStock') }}
            </span>
          </div>

          <!-- Quantity -->
          <div v-if="product.stock > 0" class="space-y-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ $t('product.quantity') }}</label>
            <div class="flex items-center space-x-3">
              <button @click="decrement" :disabled="quantity <= 1"
                class="w-10 h-10 flex items-center justify-center border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors text-surface-600 dark:text-surface-300 disabled:opacity-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
              </button>
              <span class="w-12 text-center font-semibold text-surface-800 dark:text-white">{{ quantity }}</span>
              <button @click="increment" :disabled="quantity >= product.stock"
                class="w-10 h-10 flex items-center justify-center border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors text-surface-600 dark:text-surface-300 disabled:opacity-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
          </div>

          <!-- Actions - Desktop -->
          <div v-if="product.stock > 0" class="hidden sm:flex flex-col sm:flex-row gap-3">
            <button @click="addToCart" class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all focus:ring-4 focus:ring-primary-500/30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
              {{ $t('product.addToCart') }}
            </button>
          </div>

          <!-- Out of Stock -->
          <div v-else class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
            <p class="text-red-600 dark:text-red-400 font-medium">{{ $t('product.outOfStock') }}</p>
          </div>

          <!-- Shipping Info -->
          <div class="grid grid-cols-1 xs:grid-cols-2 gap-3 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
              <span class="text-sm text-surface-600 dark:text-surface-300">{{ $t('product.shipping') }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span class="text-sm text-surface-600 dark:text-surface-300">{{ $t('product.returns') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Tabs -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
        <!-- Tab headers -->
        <div class="flex items-center gap-1 border-b border-surface-100 dark:border-surface-700 px-2 sm:px-4 overflow-x-auto scrollbar-hide">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="relative px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors"
            :class="activeTab === tab.key ? 'text-primary-600' : 'text-surface-500 hover:text-surface-800 dark:hover:text-surface-200'"
          >
            {{ tab.label }}
            <span v-if="activeTab === tab.key" class="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-500 rounded-full"></span>
          </button>
        </div>

        <!-- Tab content -->
        <div class="p-5 sm:p-6">
          <!-- Description -->
          <div v-if="activeTab === 'description'" class="animate-fade-in">
            <p class="text-surface-600 dark:text-surface-300 text-sm leading-relaxed whitespace-pre-line">
              {{ product.description }}
            </p>
          </div>

          <!-- Shipping & Returns -->
          <div v-else-if="activeTab === 'shipping'" class="animate-fade-in space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-surface-800 dark:text-white">{{ $t('product.shipping') }}</p>
                <p class="text-xs text-surface-500 mt-0.5">Free delivery on every order — no minimum required.</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-surface-800 dark:text-white">{{ $t('product.returns') }}</p>
                <p class="text-xs text-surface-500 mt-0.5">Genuine products, verified quality. Easy returns on eligible items.</p>
              </div>
            </div>
          </div>

          <!-- Reviews -->
          <div v-else class="animate-fade-in">
            <div v-if="product.numReviews === 0" class="text-center text-surface-400 py-8">
              <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              <p class="text-sm">{{ $t('product.noReviews') }}</p>
            </div>
            <div v-else class="flex items-center gap-4">
              <div class="text-center">
                <p class="text-4xl font-bold text-surface-900 dark:text-white">{{ product.rating.toFixed(1) }}</p>
                <div class="flex justify-center mt-1">
                  <svg v-for="s in 5" :key="s" class="w-4 h-4" :class="s <= Math.round(product.rating) ? 'text-amber-400' : 'text-surface-200 dark:text-surface-600'" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <p class="text-xs text-surface-400 mt-1">{{ product.numReviews }} {{ $t('product.reviews') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Floating Action Bar (above bottom nav) -->
      <div v-if="product.stock > 0" class="fixed bottom-16 left-0 right-0 z-40 bg-white/95 dark:bg-surface-800/95 backdrop-blur-md border-t border-surface-200 dark:border-surface-700 px-4 py-3 sm:hidden shadow-2xl shadow-black/20 animate-slide-up">
        <div class="flex items-center gap-3 max-w-7xl mx-auto">
          <button @click="addToCart" class="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-white font-semibold rounded-xl hover:bg-surface-200 dark:hover:bg-surface-600 transition-all active:scale-[0.98]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
            Cart
          </button>
          <button @click="buyNow" class="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all active:scale-[0.98] shadow-lg shadow-primary-500/30">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Buy Now
          </button>
        </div>
      </div>

      <!-- Bottom spacing for mobile float bar + nav -->
      <div class="h-32 sm:hidden"></div>

      <!-- Related Products -->
      <section v-if="relatedProducts.length > 0">
        <h2 class="text-lg sm:text-xl font-bold text-surface-900 dark:text-white mb-4">{{ $t('product.relatedProducts') }}</h2>
        <div class="product-grid">
          <ProductCard v-for="rp in relatedProducts" :key="rp._id" :product="rp" />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import ProductCard from '@/components/ProductCard.vue'

const { t } = useI18n()

const activeTab = ref<'description' | 'shipping' | 'reviews'>('description')
const tabs = computed(() => [
  { key: 'description' as const, label: t('product.description') },
  { key: 'shipping' as const, label: t('product.shipping') },
  { key: 'reviews' as const, label: t('product.reviews') },
])

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

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const toast = useToast()

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

const product = ref<Product | null>(null)
const relatedProducts = ref<Product[]>([])
const activePromotions = ref<Promotion[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const quantity = ref(1)
const selectedImageIndex = ref(0)

const categoryName = computed(() => {
  if (!product.value) return ''
  const cat = product.value.category
  return cat && typeof cat === 'object' ? cat.name : ''
})

const categoryId = computed(() => {
  if (!product.value) return ''
  const cat = product.value.category
  return cat && typeof cat === 'object' ? cat._id : (cat || '')
})

const selectedImage = computed(() => {
  if (!product.value?.images?.length) return ''
  return product.value.images[selectedImageIndex.value]?.secure_url || product.value.images[0]?.secure_url
})

const displayPrice = computed(() => {
  if (!product.value) return 0
  if (product.value.discount > 0) {
    return product.value.price * (1 - product.value.discount / 100)
  }
  return product.value.price
})

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

const activePromotion = computed(() => product.value ? getProductPromotion(product.value) : null)

onMounted(async () => {
  const id = route.params.id as string
  if (!id) {
    error.value = 'Invalid product ID'
    loading.value = false
    return
  }
  await Promise.all([fetchProduct(id), fetchRelatedProducts(id), fetchActivePromotions()])
})

async function fetchProduct(id: string) {
  loading.value = true
  error.value = null
  try {
    const data: any = await api.get(`/products/${id}`)
    product.value = data.product || null
    if (!product.value) {
      error.value = 'Product not found'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load product'
  } finally {
    loading.value = false
  }
}

async function fetchRelatedProducts(id: string) {
  try {
    const data: any = await api.get(`/products/${id}/related`)
    relatedProducts.value = data.products || []
  } catch (err) {
    console.error('Failed to fetch related products:', err)
  }
}

function goToProduct(id: string) {
  router.push(`/product/${id}`)
}

function increment() {
  if (product.value) {
    quantity.value = Math.min(quantity.value + 1, product.value.stock)
  }
}

function decrement() {
  quantity.value = Math.max(quantity.value - 1, 1)
}

function addToCart() {
  if (!product.value) return
  cart.addItem(product.value, quantity.value)
  toast.success(t('product.addedToCart'))
}

function buyNow() {
  if (!product.value) return
  cart.addItem(product.value, quantity.value)
  router.push('/checkout')
}
</script>
