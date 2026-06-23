<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <h1 class="text-xl sm:text-2xl font-bold text-surface-800 dark:text-white mb-6">{{ $t('cart.title') }}</h1>

    <!-- Empty State -->
    <div v-if="cart.items.length === 0" class="text-center py-16">
      <svg class="w-24 h-24 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
      </svg>
      <h2 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-2">{{ $t('cart.empty') }}</h2>
      <p class="text-surface-500 mb-6">{{ $t('cart.emptyDesc') }}</p>
      <router-link to="/" class="inline-flex items-center px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
        {{ $t('cart.continueShopping') }}
      </router-link>
    </div>

    <div v-else class="space-y-6">
      <!-- Cart Items -->
      <div class="space-y-3">
        <div v-for="item in cart.items" :key="item.productId" 
          class="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card animate-fade-in">
          <div class="flex gap-4">
            <div class="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-surface-100 dark:bg-surface-700 rounded-xl flex-shrink-0 overflow-hidden">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-8 h-8 text-surface-300 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-surface-800 dark:text-white truncate">{{ item.name }}</h3>
              <p class="text-sm text-surface-500 mt-0.5">${{ item.price.toFixed(2) }}</p>
              <div class="flex items-center justify-between mt-2 xs:mt-3">
                <div class="flex items-center space-x-1.5 xs:space-x-2">
                  <button @click="cart.updateQuantity(item.productId, item.quantity - 1)" class="w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center bg-surface-100 dark:bg-surface-700 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors">
                    <svg class="w-3 h-3 text-surface-600 dark:text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                  </button>
                  <span class="w-7 xs:w-8 text-center font-medium text-surface-800 dark:text-white text-sm">{{ item.quantity }}</span>
                  <button @click="cart.updateQuantity(item.productId, item.quantity + 1)" class="w-7 h-7 xs:w-8 xs:h-8 flex items-center justify-center bg-surface-100 dark:bg-surface-700 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors">
                    <svg class="w-3 h-3 text-surface-600 dark:text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
                <button @click="cart.removeItem(item.productId)" class="text-red-500 hover:text-red-600 p-1.5 xs:p-1">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coupon -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card">
        <div class="flex gap-2">
          <input v-model="couponCode" type="text" :placeholder="$t('cart.couponPlaceholder')"
            class="flex-1 px-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
          />
          <button @click="applyCoupon" class="px-5 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors text-sm whitespace-nowrap">
            {{ $t('cart.apply') }}
          </button>
        </div>
        <div v-if="cart.coupon" class="mt-2 flex items-center gap-2 text-sm text-accent-500">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          {{ $t('cart.discount') }} "{{ cart.coupon }}" ( -${{ cart.discountAmount.toFixed(2) }} )
          <button @click="cart.removeCoupon()" class="text-red-500 hover:text-red-600">{{ $t('cart.remove') }}</button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <h2 class="text-lg font-bold text-surface-800 dark:text-white mb-4">{{ $t('checkout.summary') }}</h2>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-surface-500">{{ $t('cart.subtotal') }}</span>
            <span class="font-medium text-surface-800 dark:text-white">${{ cart.subtotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-surface-500">{{ $t('cart.shipping') }}</span>
            <span class="font-medium" :class="cart.shipping === 0 ? 'text-accent-500' : 'text-surface-800 dark:text-white'">
              {{ cart.shipping === 0 ? $t('cart.free') : '$' + cart.shipping.toFixed(2) }}
            </span>
          </div>
          <div v-if="cart.discountAmount > 0" class="flex justify-between text-accent-500">
            <span>{{ $t('cart.discount') }}</span>
            <span>- ${{ cart.discountAmount.toFixed(2) }}</span>
          </div>
          <hr class="border-surface-200 dark:border-surface-700" />
          <div class="flex justify-between text-base font-bold">
            <span class="text-surface-800 dark:text-white">{{ $t('cart.total') }}</span>
            <span class="text-primary-500">${{ cart.total.toFixed(2) }}</span>
          </div>
        </div>
        <router-link to="/checkout" class="mt-4 block w-full py-3 bg-accent-500 text-white font-semibold text-center rounded-lg hover:bg-accent-600 transition-all focus:ring-4 focus:ring-accent-500/30">
          {{ $t('cart.proceedToCheckout') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const cart = useCartStore()
const toast = useToast()
const couponCode = ref('')

function applyCoupon() {
  if (!couponCode.value.trim()) return
  const success = cart.applyCoupon(couponCode.value)
  if (success) {
    toast.success(t('cart.couponPlaceholder') + ' applied!')
    couponCode.value = ''
  } else {
    toast.error('Invalid coupon code')
  }
}
</script>
