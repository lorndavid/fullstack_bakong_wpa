<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <!-- KHQR Bottom Sheet -->
    <KhqrCheckoutSheet />

    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-800 dark:text-white">{{ $t('checkout.title') }}</h1>
      <span class="text-sm text-surface-500">{{ $t('checkout.freeShipping') }} 🎉</span>
    </div>

    <!-- Progress Steps -->
    <div class="flex items-center mb-8">
      <div v-for="(step, idx) in steps" :key="idx" class="flex-1 flex items-center">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-250"
            :class="currentStep >= idx 
              ? 'bg-primary-500 text-white' 
              : 'bg-surface-200 dark:bg-surface-700 text-surface-400'">
            <svg v-if="currentStep > idx" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <span class="hidden sm:block text-sm font-medium" :class="currentStep >= idx ? 'text-primary-500' : 'text-surface-400'">{{ step }}</span>
        </div>
        <div v-if="idx < steps.length - 1" class="flex-1 h-0.5 mx-4 transition-colors duration-250" 
          :class="currentStep > idx ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'"></div>
      </div>
    </div>

    <!-- Step 1: Contact Information -->
    <div v-if="currentStep === 0" class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card animate-slide-up">
      <h2 class="text-lg font-bold text-surface-800 dark:text-white mb-4">{{ $t('checkout.contactInfo') }}</h2>
      <form @submit.prevent="saveAddress" class="space-y-4">
        <div>            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">{{ $t('checkout.fullName') }}</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <input v-model="address.fullName" required class="w-full pl-10 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm" :placeholder="$t('checkout.fullNamePlaceholder')" />
          </div>
        </div>
        <div>            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">{{ $t('checkout.phone') }}</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <input v-model="address.phone" required type="tel" class="w-full pl-10 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm" :placeholder="$t('checkout.phonePlaceholder')" />
          </div>
        </div>
        <div class="pt-2">
          <button type="submit" class="w-full py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all focus:ring-4 focus:ring-primary-500/30">
            {{ $t('checkout.continueToReview') }}
          </button>
        </div>
      </form>
    </div>

    <!-- Step 2: Review Order -->
    <div v-if="currentStep === 1" class="space-y-4 animate-slide-up">
      <!-- Delivery Contact -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-surface-800 dark:text-white">{{ $t('checkout.deliveryContact') }}</h3>
          <button @click="currentStep = 0" class="text-sm text-primary-500 hover:text-primary-600">{{ $t('checkout.change') }}</button>
        </div>
        <p class="text-sm text-surface-600 dark:text-surface-300">
          {{ address.fullName }}<br/>
          {{ address.phone }}
        </p>
      </div>

      <!-- Order Items -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
        <h3 class="font-semibold text-surface-800 dark:text-white mb-3">{{ $t('checkout.orderItems') }}</h3>
        <div v-for="item in cart.items" :key="item.productId" class="flex items-center gap-3 py-2 border-b border-surface-100 dark:border-surface-700 last:border-0">
          <img v-if="item.image" :src="item.image" :alt="item.name" class="w-14 h-14 bg-surface-100 dark:bg-surface-700 rounded-lg flex-shrink-0 object-cover" />
          <div v-else class="w-14 h-14 bg-surface-100 dark:bg-surface-700 rounded-lg flex-shrink-0"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-surface-800 dark:text-white truncate">{{ item.name }}</p>
            <p class="text-xs text-surface-500">{{ $t('checkout.qty') }}: {{ item.quantity }}</p>
          </div>
          <p class="text-sm font-semibold text-surface-800 dark:text-white">${{ (item.price * item.quantity).toFixed(2) }}</p>
        </div>
      </div>

      <!-- Summary -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
        <h3 class="font-semibold text-surface-800 dark:text-white mb-3">{{ $t('checkout.summary') }}</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-surface-500">{{ $t('cart.subtotal') }}</span><span>${{ cart.subtotal.toFixed(2) }}</span></div>
          <div class="flex justify-between"><span class="text-surface-500">{{ $t('cart.shipping') }}</span><span class="text-accent-500" v-if="cart.shipping === 0">{{ $t('cart.free') }}</span><span v-else>${{ cart.shipping.toFixed(2) }}</span></div>
          <div v-if="cart.discountAmount > 0" class="flex justify-between text-accent-500"><span>{{ $t('cart.discount') }}</span><span>- ${{ cart.discountAmount.toFixed(2) }}</span></div>
          <hr class="border-surface-200 dark:border-surface-700" />
          <div class="flex justify-between font-bold text-base"><span>{{ $t('cart.total') }}</span><span class="text-primary-500">${{ cart.total.toFixed(2) }}</span></div>
        </div>
      </div>

      <button @click="currentStep = 2" class="w-full py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all focus:ring-4 focus:ring-primary-500/30">
        {{ $t('checkout.continueToPayment') }}
      </button>
    </div>

    <!-- Step 3: Payment Method -->
    <div v-if="currentStep === 2" class="space-y-4 animate-slide-up">
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <h2 class="text-lg font-bold text-surface-800 dark:text-white mb-4">{{ $t('checkout.choosePayment') }}</h2>
        <div class="space-y-3">
          <label class="flex items-center p-3 xs:p-4 border-2 rounded-xl cursor-pointer transition-all duration-150"
            :class="paymentMethod === 'khqr' 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-surface-200 dark:border-surface-600 hover:border-primary-300'">
            <input type="radio" v-model="paymentMethod" value="khqr" class="w-4 h-4 text-primary-500 focus:ring-primary-500" />
            <div class="ml-3 flex items-center gap-3">
              <div class="w-10 h-10 xs:w-12 xs:h-12 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 xs:w-6 xs:h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-surface-800 dark:text-white text-sm xs:text-base">{{ $t('checkout.khqr') }}</p>
                <p class="text-xs text-surface-500">{{ $t('checkout.khqrDesc') }}</p>
              </div>
            </div>
          </label>

          <label class="flex items-center p-3 xs:p-4 border-2 rounded-xl cursor-pointer transition-all duration-150"
            :class="paymentMethod === 'cod' 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-surface-200 dark:border-surface-600 hover:border-primary-300'">
            <input type="radio" v-model="paymentMethod" value="cod" class="w-4 h-4 text-primary-500 focus:ring-primary-500" />
            <div class="ml-3 flex items-center gap-3">
              <div class="w-10 h-10 xs:w-12 xs:h-12 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 xs:w-6 xs:h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-surface-800 dark:text-white text-sm xs:text-base">{{ $t('checkout.cod') }}</p>
                <p class="text-xs text-surface-500">{{ $t('checkout.codDesc') }}</p>
              </div>
            </div>
          </label>
        </div>

        <button @click="placeOrder" :disabled="loading" class="mt-6 w-full py-3 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-all focus:ring-4 focus:ring-accent-500/30 disabled:opacity-50">
          <span v-if="loading">{{ $t('checkout.processing') }}</span>
          <span v-else>{{ $t('checkout.placeOrder') }} - ${{ cart.total.toFixed(2) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { usePaymentStore } from '@/stores/payment.store'
import { useI18n } from 'vue-i18n'
import KhqrCheckoutSheet from '@/components/khqr/KhqrCheckoutSheet.vue'
import api from '@/services/api'

const { t } = useI18n()
const router = useRouter()
const paymentStore = usePaymentStore()
const cart = useCartStore()
const auth = useAuthStore()
const toast = useToast()

const steps = computed(() => [t('checkout.contact'), t('checkout.review'), t('checkout.payment')])
const currentStep = ref(0)
const paymentMethod = ref('khqr')
const loading = ref(false)

const address = reactive({
  fullName: '',
  phone: '',
})

function saveAddress() {
  currentStep.value = 1
}

async function placeOrder() {
  if (cart.items.length === 0) {
    toast.error('Your cart is empty')
    return
  }
  loading.value = true
  try {
    // Create order via API
    const res: any = await api.post('/orders', {
      products: cart.items.map(item => ({
        productId: item.productId,
        name: item.name,
        image: item.image || '',
        price: item.originalPrice,
        quantity: item.quantity,
      })),
      shippingAddress: { ...address },
      paymentMethod: paymentMethod.value,
    })

    const order = res.order

    if (paymentMethod.value === 'khqr') {
      // Open the KHQR checkout bottom sheet
      paymentStore.openSheet({
        orderId: order._id,
        amount: order.total,
      })
    } else {
      toast.success('Order placed successfully! You will pay upon delivery.')
      cart.clearCart()
      router.push(`/order/${order._id}`)
    }
  } catch (err: any) {
    toast.error(err.message || err.error || 'Failed to place order')
  } finally {
    loading.value = false
  }
}
</script>
