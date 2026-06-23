<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <h1 class="text-xl sm:text-2xl font-bold text-surface-800 dark:text-white mb-6">{{ $t('order.title') }}</h1>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-3 text-sm text-surface-500">{{ $t('common.loading') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16">
      <p class="text-surface-500 mb-4">{{ error }}</p>
      <button @click="fetchOrders" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="text-center py-16">
      <svg class="w-24 h-24 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <h2 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-2">{{ $t('order.noOrders') }}</h2>
      <p class="text-surface-500 mb-6">{{ $t('order.startShopping') }}</p>
      <router-link to="/" class="inline-flex items-center px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
        {{ $t('order.startShopping') }}
      </router-link>
    </div>

    <!-- Order List -->
    <div v-else class="space-y-3">
      <div v-for="order in orders" :key="order._id" class="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer"
        @click="viewOrder(order._id)">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-surface-500">#{{ order._id?.slice(-8) }}</span>
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold" :class="statusClass(order.status)">
            {{ $t('order.status.' + order.status) }}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-lg flex-shrink-0"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-surface-800 dark:text-white truncate">{{ order.products?.[0]?.name || 'Order' }}</p>
            <p class="text-xs text-surface-500">{{ order.products?.length || 0 }} {{ $t('order.items') }}</p>
          </div>
          <div class="text-right">
            <p class="font-bold text-primary-500">${{ order.total?.toFixed(2) }}</p>
            <p class="text-xs text-surface-400">{{ formatDate(order.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const orders = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchOrders() {
  loading.value = true
  error.value = null
  try {
    const data: any = await api.get('/orders')
    orders.value = data.orders || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load orders'
  } finally {
    loading.value = false
  }
}

function viewOrder(id: string) {
  router.push(`/order/${id}`)
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shipping: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return map[status] || 'bg-surface-100 text-surface-500'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  fetchOrders()
})
</script>
