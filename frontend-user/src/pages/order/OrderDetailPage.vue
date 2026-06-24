<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
    <!-- Back Link -->
    <router-link to="/orders" class="inline-flex items-center gap-1.5 text-sm text-[#FF7AA2] hover:text-[#E8608A] mb-6 group transition-colors">
      <svg class="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      {{ $t('order.backToOrders') }}
    </router-link>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-3xl p-12 text-center border border-[#F1E6EA] shadow-card">
      <div class="w-10 h-10 border-3 border-[#F8D7E3] border-t-[#FF7AA2] rounded-full animate-spin mx-auto"></div>
      <p class="mt-3 text-sm text-[#666666]">{{ $t('common.loadingOrder') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-3xl p-12 text-center border border-[#F1E6EA] shadow-card animate-fade-in">
      <div class="w-16 h-16 mx-auto bg-[#FFF4F7] rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-[#FF7AA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <p class="text-sm text-[#666666] mb-4">{{ error }}</p>
      <router-link to="/orders" class="text-sm font-medium text-[#FF7AA2] hover:text-[#E8608A]">{{ $t('order.backToOrders') }}</router-link>
    </div>

    <template v-else-if="order">
      <div class="bg-white rounded-3xl p-5 sm:p-6 border border-[#F1E6EA] shadow-card space-y-6 animate-fade-in-up">
        <!-- Header with Status -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="badge-pink text-[10px]">{{ $t('order.orderId') }}</span>
              <span class="font-mono text-sm font-bold text-[#1A1A1A]">#{{ order._id?.slice(-8).toUpperCase() }}</span>
            </div>
            <p class="text-xs text-[#666666]">{{ $t('order.placed') }} {{ formatDate(order.createdAt) }}</p>
          </div>
          <span class="px-3 py-1.5 rounded-full text-xs font-semibold self-start" :class="statusBadgeClass(order.status)">
            {{ $t('order.status.' + order.status) }}
          </span>
        </div>

        <!-- Status Timeline -->
        <div class="bg-[#FFF8FA] rounded-2xl p-5 border border-[#F1E6EA]">
          <div class="flex items-start justify-between">
            <div v-for="(step, idx) in timeline" :key="idx" class="flex flex-col items-center flex-1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                :class="step.done ? 'bg-gradient-to-br from-[#FF7AA2] to-[#C084FC] shadow-soft' : 'bg-[#F1E6EA]'">
                <svg v-if="step.done" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                <div v-else class="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div class="h-0.5 w-full bg-[#F1E6EA] -mt-4 relative z-0" v-if="idx < timeline.length - 1">
                <div class="h-full bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] transition-all duration-500" :style="{ width: step.done ? '100%' : '0%' }"></div>
              </div>
              <p class="text-[11px] font-medium mt-2 text-center" :class="step.done ? 'text-[#1A1A1A]' : 'text-[#C4A8B6]'">{{ step.label }}</p>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div>
          <h3 class="font-display font-semibold text-base text-[#1A1A1A] mb-4">{{ $t('checkout.orderItems') }}</h3>
          <div v-for="item in order.products" :key="item.productId"
            class="flex items-center gap-3 py-3 border-b border-[#F1E6EA] last:border-0">
            <div class="w-14 h-14 bg-[#FFF8FA] rounded-xl overflow-hidden flex-shrink-0 border border-[#F1E6EA]">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-xl">✨</span>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-[#1A1A1A] truncate">{{ item.name }}</p>
              <p class="text-xs text-[#666666] mt-0.5">{{ $t('checkout.qty') }}: {{ item.quantity }} × ${{ item.price.toFixed(2) }}</p>
            </div>
            <p class="text-sm font-bold text-[#1A1A1A]">${{ (item.price * item.quantity).toFixed(2) }}</p>
          </div>
        </div>

        <!-- Contact & Payment -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-[#FFF8FA] rounded-2xl p-4 border border-[#F1E6EA]">
            <h3 class="font-semibold text-sm text-[#1A1A1A] mb-2">{{ $t('order.contact') }}</h3>
            <p class="text-sm text-[#666666] leading-relaxed">
              {{ order.shippingAddress?.fullName }}<br/>
              {{ order.shippingAddress?.phone }}
            </p>
          </div>
          <div class="bg-[#FFF8FA] rounded-2xl p-4 border border-[#F1E6EA]">
            <h3 class="font-semibold text-sm text-[#1A1A1A] mb-2">{{ $t('order.payment') }}</h3>
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                :class="order.paymentMethod === 'khqr' ? 'bg-gradient-to-br from-[#FF7AA2] to-[#C084FC]' : 'bg-[#E6FFE6]'">
                <svg v-if="order.paymentMethod === 'khqr'" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
                <svg v-else class="w-4 h-4 text-[#34C759]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <span class="text-sm text-[#666666] capitalize">{{ order.paymentMethod === 'khqr' ? $t('checkout.khqr') : $t('checkout.cod') }}</span>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="border-t border-[#F1E6EA] pt-4 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-[#666666]">{{ $t('order.subtotal') }}</span>
            <span class="font-semibold text-[#1A1A1A]">${{ order.subtotal?.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#666666]">{{ $t('order.shipping') }}</span>
            <span class="text-[#34C759] font-semibold">{{ $t('cart.free') }}</span>
          </div>
          <div v-if="order.discountAmount > 0" class="flex justify-between text-[#34C759]">
            <span>{{ $t('order.discount') }}</span>
            <span>- ${{ order.discountAmount.toFixed(2) }}</span>
          </div>
          <hr class="border-[#F1E6EA]" />
          <div class="flex justify-between font-bold text-base">
            <span class="text-[#1A1A1A]">{{ $t('order.total') }}</span>
            <span class="text-[#FF7AA2]">${{ order.total?.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const order = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-[#FFF4F7] text-[#FF7AA2]',
    confirmed: 'bg-[#F5F3FF] text-[#C084FC]',
    shipping: 'bg-[#FEF3C7] text-amber-600',
    delivered: 'bg-[#E6FFE6] text-[#34C759]',
    cancelled: 'bg-[#FFF4F7] text-red-500',
  }
  return map[status] || 'bg-[#FFF8FA] text-[#666666]'
}

const timeline = computed(() => {
  const status = order.value?.status || 'pending'
  const steps = [
    { label: t('order.timeline.placed'), done: true },
    { label: t('order.timeline.confirmed'), key: 'confirmed', done: ['confirmed', 'shipping', 'delivered'].includes(status) },
    { label: t('order.timeline.delivery'), key: 'delivery', done: ['shipping', 'delivered'].includes(status) },
    { label: t('order.timeline.delivered'), key: 'delivered', done: status === 'delivered' },
  ]
  if (status === 'cancelled') {
    steps[1].label = t('order.timeline.cancelled')
    steps[1].done = true
    steps[2].done = false
    steps[3].done = false
  }
  return steps
})

onMounted(async () => {
  const id = route.params.id as string
  if (!id) { error.value = 'Invalid order ID'; loading.value = false; return }
  try {
    const data: any = await api.get(`/orders/${id}`)
    order.value = data.order
    if (!order.value) error.value = 'Order not found'
  } catch (err: any) {
    error.value = err.message || 'Failed to load order'
  } finally { loading.value = false }
})

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
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
