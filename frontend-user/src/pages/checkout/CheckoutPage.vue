<template>
  <div class="bg-white min-h-screen">
    <!-- KHQR Bottom Sheet -->
    <KhqrCheckoutSheet />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{{ $t('checkout.title') }}</h1>
          <p class="text-body-sm text-[#666666] mt-1">Complete your purchase securely</p>
        </div>
        <router-link to="/cart" class="text-sm font-medium text-[#FF7AA2] hover:text-[#E8608A] transition-colors">
          ← Back to Cart
        </router-link>
      </div>

      <!-- Progress Steps -->
      <div class="flex items-center justify-center mb-10">
        <div v-for="(step, idx) in steps" :key="idx" class="flex items-center">
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
              :class="currentStep >= idx ? 'bg-[#FF7AA2] text-white shadow-pink' : 'bg-[#FFF4F7] text-[#C4A8B6]'">
              <svg v-if="currentStep > idx" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <span class="text-xs font-medium mt-1.5" :class="currentStep >= idx ? 'text-[#FF7AA2]' : 'text-[#C4A8B6]'">{{ step }}</span>
          </div>
          <div v-if="idx < steps.length - 1" class="w-16 sm:w-24 h-0.5 mx-3 rounded-full transition-colors duration-300"
            :class="currentStep > idx ? 'bg-[#FF7AA2]' : 'bg-[#F1E6EA]'"></div>
        </div>
      </div>

      <!-- Step 1: Contact -->
      <div v-if="currentStep === 0" class="max-w-lg mx-auto animate-fade-in-up">
        <div class="bg-[#FFF8FA] rounded-3xl p-6 sm:p-8 border border-[#F1E6EA]">
          <h2 class="font-display text-xl font-bold text-[#1A1A1A] mb-6">{{ $t('checkout.contactInfo') }}</h2>
          <form @submit.prevent="saveAddress" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-[#1A1A1A] mb-1.5">{{ $t('checkout.fullName') }}</label>
              <div class="relative">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A8B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <input v-model="address.fullName" required class="input-beauty !pl-11" :placeholder="$t('checkout.fullNamePlaceholder')" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1A1A1A] mb-1.5">{{ $t('checkout.phone') }}</label>
              <div class="relative">
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4A8B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <input v-model="address.phone" required type="tel" class="input-beauty !pl-11" :placeholder="$t('checkout.phonePlaceholder')" />
              </div>
            </div>
            <button type="submit" class="btn-primary w-full !py-3.5">Continue to Review</button>
          </form>
        </div>
      </div>

      <!-- Step 2: Review -->
      <div v-if="currentStep === 1" class="max-w-2xl mx-auto space-y-4 animate-fade-in-up">
        <!-- Contact Card -->
        <div class="bg-white rounded-2xl p-5 border border-[#F1E6EA] flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-[#666666] uppercase tracking-wider">Delivery Contact</p>
            <p class="text-sm font-semibold text-[#1A1A1A] mt-1">{{ address.fullName }} · {{ address.phone }}</p>
          </div>
          <button @click="currentStep = 0" class="text-sm text-[#FF7AA2] hover:text-[#E8608A] font-medium">Change</button>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-2xl p-5 border border-[#F1E6EA]">
          <h3 class="font-display font-semibold text-base text-[#1A1A1A] mb-4">Order Items</h3>
          <div v-for="item in cart.items" :key="item.productId" class="flex items-center gap-4 py-3 border-b border-[#F1E6EA] last:border-0">
            <div class="w-14 h-14 bg-[#FFF8FA] rounded-xl overflow-hidden flex-shrink-0 border border-[#F1E6EA]">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center"><span class="text-xl">✨</span></div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-[#1A1A1A] truncate">{{ item.name }}</p>
              <p class="text-[11px] text-[#666666] mt-0.5">Qty: {{ item.quantity }}</p>
            </div>
            <p class="text-sm font-bold text-[#1A1A1A]">${{ (item.price * item.quantity).toFixed(2) }}</p>
          </div>
        </div>

        <!-- Summary -->
        <div class="bg-[#FFF8FA] rounded-2xl p-5 border border-[#F1E6EA]">
          <div class="space-y-2.5 text-sm">
            <div class="flex justify-between"><span class="text-[#666666]">Subtotal</span><span class="font-semibold">${{ cart.subtotal.toFixed(2) }}</span></div>
            <div class="flex justify-between"><span class="text-[#666666]">Shipping</span><span class="font-semibold text-[#34C759]">FREE</span></div>
            <div v-if="cart.discountAmount > 0" class="flex justify-between text-[#34C759]"><span>Discount</span><span>- ${{ cart.discountAmount.toFixed(2) }}</span></div>
            <hr class="border-[#F1E6EA]" />
            <div class="flex justify-between text-base"><span class="font-bold text-[#1A1A1A]">Total</span><span class="font-bold text-lg text-[#FF7AA2]">${{ cart.total.toFixed(2) }}</span></div>
          </div>
        </div>

        <button @click="currentStep = 2" class="btn-primary w-full !py-3.5">Continue to Payment</button>
      </div>

      <!-- Step 3: Payment -->
      <div v-if="currentStep === 2" class="max-w-lg mx-auto animate-fade-in-up">
        <div class="bg-[#FFF8FA] rounded-3xl p-6 sm:p-8 border border-[#F1E6EA]">
          <h2 class="font-display text-xl font-bold text-[#1A1A1A] mb-6">{{ $t('checkout.choosePayment') }}</h2>
          <div class="space-y-4">
            <!-- KHQR -->
            <label class="flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200"
              :class="paymentMethod === 'khqr' ? 'border-[#FF7AA2] bg-[#FFF4F7]' : 'border-[#F1E6EA] hover:border-[#FF7AA2]/50'">
              <input type="radio" v-model="paymentMethod" value="khqr" class="w-4 h-4 text-[#FF7AA2] focus:ring-[#FF7AA2]" />
              <div class="flex items-center gap-4 flex-1">
                <div class="w-12 h-12 bg-gradient-to-br from-[#FF7AA2] to-[#C084FC] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span class="text-white font-bold text-sm">KH</span>
                </div>
                <div>
                  <p class="font-semibold text-sm text-[#1A1A1A]">{{ $t('checkout.khqr') }}</p>
                  <p class="text-xs text-[#666666]">{{ $t('checkout.khqrDesc') }}</p>
                </div>
              </div>
              <span class="badge-pink text-[10px]">Fast</span>
            </label>

            <!-- COD -->
            <label class="flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200"
              :class="paymentMethod === 'cod' ? 'border-[#FF7AA2] bg-[#FFF4F7]' : 'border-[#F1E6EA] hover:border-[#FF7AA2]/50'">
              <input type="radio" v-model="paymentMethod" value="cod" class="w-4 h-4 text-[#FF7AA2] focus:ring-[#FF7AA2]" />
              <div class="flex items-center gap-4 flex-1">
                <div class="w-12 h-12 bg-gradient-to-br from-[#34C759] to-[#28A745] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </div>
                <div>
                  <p class="font-semibold text-sm text-[#1A1A1A]">{{ $t('checkout.cod') }}</p>
                  <p class="text-xs text-[#666666]">{{ $t('checkout.codDesc') }}</p>
                </div>
              </div>
              <span class="badge-success text-[10px]">Free</span>
            </label>
          </div>

          <!-- Trust Badges -->
          <div class="mt-6 pt-6 border-t border-[#F1E6EA] flex justify-center gap-6">
            <div class="flex items-center gap-2 text-xs text-[#666666]">
              <svg class="w-4 h-4 text-[#34C759]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
              Secure Payment
            </div>
            <div class="flex items-center gap-2 text-xs text-[#666666]">
              <svg class="w-4 h-4 text-[#34C759]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              Encrypted
            </div>
            <div class="flex items-center gap-2 text-xs text-[#666666]">
              <svg class="w-4 h-4 text-[#34C759]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/></svg>
              Buyer Protection
            </div>
          </div>

          <button @click="placeOrder" :disabled="loading" class="btn-primary w-full !py-3.5 mt-6">
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Processing...
            </span>
            <span v-else>Place Order — ${{ cart.total.toFixed(2) }}</span>
          </button>
        </div>
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

const address = reactive({ fullName: '', phone: '' })

function saveAddress() { currentStep.value = 1 }

async function placeOrder() {
  if (cart.items.length === 0) {
    toast.error('Your cart is empty')
    return
  }
  loading.value = true
  try {
    const res: any = await api.post('/orders', {
      products: cart.items.map(item => ({
        productId: item.productId, name: item.name, image: item.image || '',
        price: item.originalPrice, quantity: item.quantity,
      })),
      shippingAddress: { ...address },
      paymentMethod: paymentMethod.value,
    })
    const order = res.order
    if (paymentMethod.value === 'khqr') {
      paymentStore.openSheet({ orderId: order._id, amount: order.total })
    } else {
      toast.success('Order placed! Pay upon delivery.')
      cart.clearCart()
      router.push(`/order/${order._id}`)
    }
  } catch (err: any) {
    toast.error(err.message || 'Failed to place order')
  } finally {
    loading.value = false
  }
}
</script>
