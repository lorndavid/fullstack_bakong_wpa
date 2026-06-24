<template>
  <div class="bg-white min-h-screen">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{{ $t('cart.title') }}</h1>
          <p v-if="cart.items.length > 0" class="text-body-sm text-[#666666] mt-1">{{ cart.totalItems }} items in your bag</p>
        </div>
        <router-link to="/" class="text-sm font-medium text-[#FF7AA2] hover:text-[#E8608A] transition-colors">
          Continue Shopping →
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-if="cart.items.length === 0" class="text-center py-20">
        <div class="w-24 h-24 mx-auto mb-6 bg-[#FFF8FA] rounded-full flex items-center justify-center">
          <span class="text-5xl">🛍️</span>
        </div>
        <h2 class="font-display text-xl font-bold text-[#1A1A1A] mb-2">{{ $t('cart.empty') }}</h2>
        <p class="text-[#666666] mb-8">{{ $t('cart.emptyDesc') }}</p>
        <router-link to="/" class="btn-primary">{{ $t('cart.continueShopping') }}</router-link>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          <div v-for="item in cart.items" :key="item.productId"
            class="flex gap-4 sm:gap-6 p-4 sm:p-5 bg-[#FFF8FA] rounded-2xl border border-[#F1E6EA] hover:shadow-card transition-all duration-200 group">
            <!-- Image -->
            <div class="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-[#F1E6EA]">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center"><span class="text-2xl">✨</span></div>
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3 class="font-display font-semibold text-sm sm:text-base text-[#1A1A1A]">{{ item.name }}</h3>
                  <p class="text-sm text-[#666666] mt-0.5">${{ item.price.toFixed(2) }}</p>
                </div>
                <button @click="cart.removeItem(item.productId)" class="p-1.5 text-[#C4A8B6] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center bg-white rounded-xl border border-[#F1E6EA] p-0.5">
                  <button @click="cart.updateQuantity(item.productId, item.quantity - 1)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FFF8FA] transition-colors text-[#666666]">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                  </button>
                  <span class="w-10 text-center font-semibold text-sm text-[#1A1A1A]">{{ item.quantity }}</span>
                  <button @click="cart.updateQuantity(item.productId, item.quantity + 1)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FFF8FA] transition-colors text-[#666666]">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  </button>
                </div>
                <p class="font-bold text-base text-[#1A1A1A]">${{ (item.price * item.quantity).toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-3xl p-6 border border-[#F1E6EA] shadow-card sticky top-24">
            <h2 class="font-display text-lg font-bold text-[#1A1A1A] mb-5">Order Summary</h2>
            <div class="space-y-3.5 text-sm">
              <div class="flex justify-between">
                <span class="text-[#666666]">Subtotal</span>
                <span class="font-semibold text-[#1A1A1A]">${{ cart.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#666666]">Shipping</span>
                <span class="font-semibold text-[#34C759]">{{ cart.shipping === 0 ? 'FREE' : '$' + cart.shipping.toFixed(2) }}</span>
              </div>
              <div v-if="cart.discountAmount > 0" class="flex justify-between text-[#34C759]">
                <span>Discount</span>
                <span>- ${{ cart.discountAmount.toFixed(2) }}</span>
              </div>
              <hr class="border-[#F1E6EA]" />
              <div class="flex justify-between text-base">
                <span class="font-semibold text-[#1A1A1A]">Total</span>
                <span class="font-bold text-lg text-[#FF7AA2]">${{ cart.total.toFixed(2) }}</span>
              </div>
            </div>

            <router-link to="/checkout" class="btn-primary w-full !py-3.5 mt-6 text-center">
              Checkout — ${{ cart.total.toFixed(2) }}
            </router-link>

            <!-- Coupon -->
            <div class="mt-4 pt-4 border-t border-[#F1E6EA]">
              <div class="flex gap-2">
                <input v-model="couponCode" type="text" placeholder="Coupon code"
                  class="input-beauty flex-1 !py-2.5 text-sm" />
                <button @click="applyCoupon" class="btn-secondary !py-2.5 !px-4 text-sm">Apply</button>
              </div>
              <div v-if="cart.coupon" class="mt-2 flex items-center gap-2 text-sm text-[#34C759]">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                Coupon "{{ cart.coupon }}" applied ( -${{ cart.discountAmount.toFixed(2) }} )
                <button @click="cart.removeCoupon()" class="text-red-500 hover:text-red-600 ml-auto">Remove</button>
              </div>
            </div>

            <!-- Trust badges -->
            <div class="mt-4 pt-4 border-t border-[#F1E6EA]">
              <div class="flex justify-center gap-4">
                <div class="flex items-center gap-1.5 text-xs text-[#666666]">
                  <svg class="w-4 h-4 text-[#34C759]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                  Secure Checkout
                </div>
                <div class="flex items-center gap-1.5 text-xs text-[#666666]">
                  <svg class="w-4 h-4 text-[#34C759]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                  SSL Encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const cart = useCartStore()
const toast = useToast()
const couponCode = ref('')

function applyCoupon() {
  if (!couponCode.value.trim()) return
  if (cart.applyCoupon(couponCode.value)) {
    toast.success('Coupon applied!')
    couponCode.value = ''
  } else {
    toast.error('Invalid coupon code')
  }
}
</script>
