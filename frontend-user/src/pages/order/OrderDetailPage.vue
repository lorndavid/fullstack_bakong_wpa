<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <router-link to="/orders" class="inline-flex items-center text-sm text-primary-500 hover:text-primary-600 mb-4 group">
      <svg class="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      {{ $t('order.backToOrders') }}
    </router-link>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl p-8 text-center shadow-card">
      <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-3 text-sm text-surface-500">{{ $t('common.loadingOrder') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl p-8 text-center shadow-card">
      <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p class="text-surface-500 text-sm mb-3">{{ error }}</p>
      <router-link to="/orders" class="text-sm text-primary-500 hover:text-primary-600 font-medium">{{ $t('order.backToOrders') }}</router-link>
    </div>

    <template v-else-if="order">
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('order.detail') }} #{{ order._id?.slice(-8) }}</h1>
            <p class="text-sm text-surface-500">{{ $t('order.placed') }} {{ formatDate(order.createdAt) }}</p>
          </div>
          <span class="px-3 py-1.5 rounded-full text-xs font-semibold" :class="statusBadgeClass(order.status)">
            {{ $t('order.status.' + order.status) }}
          </span>
        </div>

        <!-- Status Timeline -->
        <div class="space-y-3">
          <div v-for="(step, idx) in timeline" :key="idx" class="flex items-start gap-3">
            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                :class="step.done ? 'bg-accent-500' : 'bg-surface-200 dark:bg-surface-700'">
                <svg v-if="step.done" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                <div v-else class="w-2 h-2 bg-surface-400 rounded-full"></div>
              </div>
              <div v-if="idx < timeline.length - 1" class="w-0.5 h-8 bg-surface-200 dark:bg-surface-700"></div>
            </div>
            <div class="pt-1.5">
              <p class="text-sm font-medium" :class="step.done ? 'text-surface-800 dark:text-white' : 'text-surface-400'">{{ step.label }}</p>
              <p v-if="step.done && step.time" class="text-xs text-surface-500 mt-0.5">{{ step.time }}</p>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div>
          <h3 class="font-semibold text-surface-800 dark:text-white mb-3">{{ $t('checkout.orderItems') }}</h3>
          <div v-for="item in order.products" :key="item.productId" class="flex items-center gap-3 py-3 border-b border-surface-100 dark:border-surface-700 last:border-0">
            <img v-if="item.image" :src="item.image" :alt="item.name" class="w-14 h-14 bg-surface-100 dark:bg-surface-700 rounded-lg flex-shrink-0 object-cover" />
            <div v-else class="w-14 h-14 bg-surface-100 dark:bg-surface-700 rounded-lg flex-shrink-0 flex items-center justify-center">
              <svg class="w-6 h-6 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-surface-800 dark:text-white truncate">{{ item.name }}</p>
              <p class="text-xs text-surface-500">{{ $t('checkout.qty') }}: {{ item.quantity }} × ${{ item.price.toFixed(2) }}</p>
            </div>
            <p class="text-sm font-semibold text-surface-800 dark:text-white">${{ (item.price * item.quantity).toFixed(2) }}</p>
          </div>
        </div>

        <!-- Contact & Payment -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 class="font-semibold text-surface-800 dark:text-white mb-2">{{ $t('order.contact') }}</h3>
            <p class="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
              {{ order.shippingAddress?.fullName }}<br/>
              {{ order.shippingAddress?.phone }}
            </p>
          </div>
          <div>
            <h3 class="font-semibold text-surface-800 dark:text-white mb-2">{{ $t('order.payment') }}</h3>
            <div class="flex items-center gap-2">
              <div v-if="order.paymentMethod === 'khqr'" class="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
              </div>
              <div v-else class="w-8 h-8 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <span class="text-sm text-surface-600 dark:text-surface-300 capitalize">{{ order.paymentMethod === 'khqr' ? $t('checkout.khqr') : $t('checkout.cod') }}</span>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="border-t border-surface-200 dark:border-surface-700 pt-4 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-surface-500">{{ $t('order.subtotal') }}</span>
            <span class="font-medium text-surface-800 dark:text-white">${{ order.subtotal?.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-surface-500">{{ $t('order.shipping') }}</span>
            <span class="text-accent-500 font-medium">{{ $t('cart.free') }}</span>
          </div>
          <div v-if="order.discountAmount > 0" class="flex justify-between text-accent-500">
            <span>{{ $t('order.discount') }}</span>
            <span>- ${{ order.discountAmount.toFixed(2) }}</span>
          </div>
          <hr class="border-surface-200 dark:border-surface-700" />
          <div class="flex justify-between font-bold text-base">
            <span class="text-surface-800 dark:text-white">{{ $t('order.total') }}</span>
            <span class="text-primary-500">${{ order.total?.toFixed(2) }}</span>
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
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shipping: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return map[status] || 'bg-surface-100 text-surface-500'
}

const timeline = computed(() => {
  const status = order.value?.status || 'pending'
  const steps = [
    { label: t('order.timeline.placed'), key: 'placed', done: true, time: order.value?.createdAt ? formatDate(order.value.createdAt) : '' },
    { label: t('order.timeline.confirmed'), key: 'confirmed', done: ['confirmed', 'shipping', 'delivered'].includes(status), time: '' },
    { label: t('order.timeline.delivery'), key: 'delivery', done: ['shipping', 'delivered'].includes(status), time: '' },
    { label: t('order.timeline.delivered'), key: 'delivered', done: status === 'delivered', time: '' },
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
  if (!id) {
    error.value = 'Invalid order ID'
    loading.value = false
    return
  }
  try {
    const data: any = await api.get(`/orders/${id}`)
    order.value = data.order
    if (!order.value) {
      error.value = 'Order not found'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load order'
  } finally {
    loading.value = false
  }
})

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
