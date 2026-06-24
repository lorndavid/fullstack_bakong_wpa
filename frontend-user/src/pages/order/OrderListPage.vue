<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
    <!-- Header -->
    <div class="text-center sm:text-left mb-8">
      <span class="badge-pink mb-2 inline-block">{{ $t('nav.orders') }}</span>
      <h1 class="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{{ $t('order.title') }}</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-5 border border-[#F1E6EA] animate-pulse">
        <div class="flex gap-4">
          <div class="w-14 h-14 bg-[#FFF4F7] rounded-xl flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-[#FFF4F7] rounded w-1/3"></div>
            <div class="h-3 bg-[#FFF4F7] rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20 animate-fade-in">
      <div class="w-16 h-16 mx-auto bg-[#FFF4F7] rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-[#FF7AA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <p class="text-sm text-[#666666] mb-4">{{ error }}</p>
      <button @click="fetchOrders" class="px-5 py-2.5 bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-button">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="text-center py-20 animate-fade-in">
      <div class="w-20 h-20 mx-auto bg-[#FFF8FA] rounded-full flex items-center justify-center mb-5">
        <span class="text-4xl">🛍️</span>
      </div>
      <h2 class="font-display text-lg font-bold text-[#1A1A1A] mb-1">{{ $t('order.noOrders') }}</h2>
      <p class="text-sm text-[#666666] mb-6">{{ $t('order.startShopping') }}</p>
      <router-link to="/" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] text-white font-semibold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-button">
        {{ $t('order.startShopping') }}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
      </router-link>
    </div>

    <!-- Order List -->
    <div v-else class="space-y-3 animate-fade-in-up">
      <div v-for="order in orders" :key="order._id"
        @click="viewOrder(order._id)"
        class="bg-white rounded-2xl p-4 sm:p-5 border border-[#F1E6EA] hover:shadow-card-hover hover:border-[#F8D7E3] transition-all duration-200 cursor-pointer group">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-medium text-[#C4A8B6]">
            #{{ order._id?.slice(-8).toUpperCase() }}
          </span>
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold" :class="statusClass(order.status)">
            {{ $t('order.status.' + order.status) }}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 bg-[#FFF8FA] rounded-xl overflow-hidden flex-shrink-0 border border-[#F1E6EA]">
            <img v-if="order.products?.[0]?.image" :src="order.products[0].image" alt="" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-6 h-6 text-[#F1E6EA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[#1A1A1A] truncate group-hover:text-[#FF7AA2] transition-colors">
              {{ order.products?.[0]?.name || 'Order' }}
              <span v-if="(order.products?.length || 0) > 1" class="text-[#666666] font-normal"> + {{ order.products.length - 1 }} more</span>
            </p>
            <p class="text-xs text-[#666666] mt-0.5">{{ formatDate(order.createdAt) }} · {{ order.products?.length || 0 }} {{ $t('order.items') }}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-base font-bold text-[#1A1A1A]">${{ order.total?.toFixed(2) }}</p>
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

function viewOrder(id: string) { router.push(`/order/${id}`) }

function statusClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-[#FFF4F7] text-[#FF7AA2]',
    confirmed: 'bg-[#F5F3FF] text-[#C084FC]',
    shipping: 'bg-[#FEF3C7] text-amber-600',
    delivered: 'bg-[#E6FFE6] text-[#34C759]',
    cancelled: 'bg-[#FFF4F7] text-red-500',
  }
  return map[status] || 'bg-[#FFF4F7] text-[#666666]'
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => { fetchOrders() })
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
