<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">{{ $t('cart.title') }}</h1>
      <span v-if="cart.items.length" class="text-sm text-surface-500">{{ cart.totalItems }} {{ $t('checkout.qty') }}</span>
    </div>

    <!-- Empty State -->
    <div v-if="cart.items.length === 0" class="text-center py-16">
      <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
        <svg class="w-12 h-12 text-surface-300 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-2">{{ $t('cart.empty') }}</h2>
      <p class="text-surface-500 mb-6">{{ $t('cart.emptyDesc') }}</p>
      <router-link to="/" class="btn-primary btn-lg">
        {{ $t('cart.continueShopping') }}
      </router-link>
    </div>

    <div v-else class="grid lg:grid-cols-3 gap-6 items-start">
      <!-- Cart Items -->
      <div class="lg:col-span-2 space-y-3">
        <!-- Free shipping banner -->
        <div class="flex items-center gap-2.5 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50">
          <svg class="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
          <p class="text-sm font-medium text-primary-700 dark:text-primary-300">🎉 You've unlocked <strong>free shipping</strong> on this order!</p>
        </div>

        <div v-for="item in cart.items" :key="item.productId"
          class="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card border border-surface-100 dark:border-surface-700/60 animate-fade-in">
          <div class="flex gap-4">
            <router-link :to="`/product/${item.productId}`" class="w-20 h-20 sm:w-24 sm:h-24 bg-surface-100 dark:bg-surface-700 rounded-xl flex-shrink-0 overflow-hidden">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-8 h-8 text-surface-300 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            </router-link>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <router-link :to="`/product/${item.productId}`" class="font-semibold text-surface-900 dark:text-white line-clamp-2 hover:text-primary-600 transition-colors">{{ item.name }}</router-link>
                <button @click="cart.removeItem(item.productId)" class="text-surface-400 hover:text-danger p-1 flex-shrink-0 transition-colors" aria-label="Remove">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
              <div class="flex items-baseline gap-2 mt-0.5">
                <span class="text-sm font-semibold text-surface-900 dark:text-white">${{ item.price.toFixed(2) }}</span>
                <span v-if="item.discount > 0" class="text-xs text-surface-400 line-through">${{ item.originalPrice.toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center gap-1.5">
                  <button @click="cart.updateQuantity(item.productId, item.quantity - 1)" class="w-8 h-8 flex items-center justify-center bg-surface-100 dark:bg-surface-700 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors active:scale-90">
                    <svg class="w-3 h-3 text-surface-600 dark:text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                  </button>
                  <span class="w-8 text-center font-semibold text-surface-900 dark:text-white text-sm">{{ item.quantity }}</span>
                  <button @click="cart.updateQuantity(item.productId, item.quantity + 1)" class="w-8 h-8 flex items-center justify-center bg-surface-100 dark:bg-surface-700 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors active:scale-90">
                    <svg class="w-3 h-3 text-surface-600 dark:text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
                <span class="text-base font-bold text-surface-900 dark:text-white">${{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card border border-surface-100 dark:border-surface-700/60 lg:sticky lg:top-24">
        <h2 class="text-lg font-bold text-surface-900 dark:text-white mb-4">{{ $t('checkout.summary') }}</h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-surface-500">{{ $t('cart.subtotal') }}</span>
            <span class="font-medium text-surface-900 dark:text-white">${{ cart.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-surface-500">{{ $t('cart.shipping') }}</span>
            <span class="font-medium" :class="cart.shipping === 0 ? 'text-primary-600' : 'text-surface-900 dark:text-white'">
              {{ cart.shipping === 0 ? $t('cart.free') : '$' + cart.shipping.toFixed(2) }}
            </span>
          </div>

          <!-- Promotion Savings -->
          <div v-if="cart.promotionSavings > 0" class="flex justify-between">
            <span class="text-primary-600 font-medium">{{ $t('cart.promotionDiscount') }}</span>
            <span class="text-primary-600 font-medium">- ${{ cart.promotionSavings.toFixed(2) }}</span>
          </div>

          <hr class="border-surface-200 dark:border-surface-700" />
          <div class="flex justify-between text-base font-bold">
            <span class="text-surface-900 dark:text-white">{{ $t('cart.total') }}</span>
            <span class="text-primary-600">${{ cart.total.toFixed(2) }}</span>
          </div>
        </div>
        <router-link to="/checkout" class="mt-5 btn-primary btn-lg w-full">
          {{ $t('cart.proceedToCheckout') }}
        </router-link>
        <router-link to="/" class="mt-2 btn-ghost btn-md w-full">
          {{ $t('cart.continueShopping') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()

onMounted(() => {
  cart.fetchPromotions()
})
</script>
