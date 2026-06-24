<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="inline-block w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-3 text-sm text-surface-500">{{ $t('common.loadingDashboard') }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <p class="text-red-500 text-sm mb-3">{{ error }}</p>
      <button @click="fetchStats" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('common.retry') }}</button>
    </div>

    <template v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-surface-500">{{ $t('dashboard.totalRevenue') }}</span>
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #E6FFE6">
              <svg class="w-5 h-5" style="color: #00C853" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-surface-800 dark:text-white">${{ stats.revenue.toLocaleString() }}</p>
          <p class="text-xs text-surface-400 mt-1">{{ $t('dashboard.fromOrders', { count: stats.totalOrders }) }}</p>
        </div>

        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-surface-500">{{ $t('dashboard.totalOrders') }}</span>
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #E6F0FF">
              <svg class="w-5 h-5" style="color: #0055A4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-surface-800 dark:text-white">{{ stats.totalOrders.toLocaleString() }}</p>
          <p class="text-xs text-surface-400 mt-1">{{ getRecentOrdersCount }} {{ $t('dashboard.recentOrders') }}</p>
        </div>

        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-surface-500">{{ $t('dashboard.totalProducts') }}</span>
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #F3E8FF">
              <svg class="w-5 h-5" style="color: #7C3AED" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-surface-800 dark:text-white">{{ stats.totalProducts.toLocaleString() }}</p>
          <p class="text-xs text-surface-400 mt-1">{{ $t('dashboard.inCatalog') }}</p>
        </div>

        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-surface-500">{{ $t('dashboard.totalUsers') }}</span>
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #FEF3C7">
              <svg class="w-5 h-5" style="color: #F59E0B" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-surface-800 dark:text-white">{{ stats.totalUsers.toLocaleString() }}</p>
          <p class="text-xs text-surface-400 mt-1">{{ $t('dashboard.registeredUsers') }}</p>
        </div>

        <!-- Promotion Discount Summary (5th card) -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-surface-500">{{ $t('dashboard.promotionDiscounts') }}</span>
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #FCE4EC">
              <svg class="w-5 h-5" style="color: #E91E63" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            </div>
          </div>
          <p class="text-2xl font-bold" style="color: #E91E63">${{ (stats.totalPromotionDiscount || 0).toLocaleString() }}</p>
          <p class="text-xs text-surface-400 mt-1">{{ $t('dashboard.acrossOrders', { count: stats.totalOrders }) }}</p>
        </div>
      </div>

      <!-- Charts & Recent Orders -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Chart -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
          <h3 class="font-semibold text-surface-800 dark:text-white mb-4">{{ $t('dashboard.revenueChart') }}</h3>
          <div v-if="chartData.length === 0" class="h-64 flex items-center justify-center text-surface-400 text-sm">
            {{ $t('dashboard.noRevenueData') }}
          </div>
          <div v-else class="h-64 flex items-end gap-1.5 sm:gap-2">
            <div v-for="(day, i) in chartData" :key="i" class="flex-1 flex flex-col items-center gap-1 group relative">
              <div class="w-full rounded-t-lg transition-all duration-250 hover:opacity-80 cursor-pointer relative" :style="{ height: day.percent + '%', background: 'linear-gradient(to top, #0055A4, #0D6EFD)' }">
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-800 dark:bg-surface-700 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                  ${{ day.revenue.toFixed(0) }}
                </div>
              </div>
              <span class="text-[10px] text-surface-400">{{ day.label }}</span>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-surface-800 dark:text-white">{{ $t('dashboard.recentOrders') }}</h3>
            <router-link to="/orders" class="text-sm text-primary-500 hover:text-primary-600">{{ $t('common.viewAll') }}</router-link>
          </div>
          <div v-if="recentOrders.length === 0" class="text-center py-8 text-surface-400 text-sm">
            {{ $t('dashboard.noRecentOrders') }}
          </div>
          <div v-else class="space-y-3">
            <div v-for="order in recentOrders" :key="order._id" class="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-700 last:border-0">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center text-xs font-bold text-surface-500">
                  <span>{{ order.userId?.name?.charAt(0) || '?' }}</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-surface-800 dark:text-white">#{{ order._id?.slice(-8).toUpperCase() }}</p>
                  <p class="text-xs text-surface-400">${{ order.total?.toFixed(2) }} · {{ order.products?.length || 0 }} {{ $t('dashboard.items') }}</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-medium" :class="statusClass(order.status)">
                {{ order.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Status Distribution -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <h3 class="font-semibold text-surface-800 dark:text-white mb-4">{{ $t('dashboard.orderStatus') }}</h3>
        <div v-if="Object.keys(statusCounts).length === 0" class="text-center py-6 text-surface-400 text-sm">
          {{ $t('dashboard.noOrders') }}
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div v-for="(count, status) in statusCounts" :key="status" class="text-center p-4 rounded-xl" :style="{ background: statusBgColor(status) }">
            <p class="text-2xl font-bold" :style="{ color: statusTextColor(status) }">{{ count }}</p>
            <p class="text-xs text-surface-500 mt-1 capitalize">{{ $t('orders.' + status) }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalProducts: number
  revenue: number
  totalPromotionDiscount: number
  orderStatusCounts: Record<string, number>
  recentOrders: any[]
  salesData: { _id: string; total: number; count: number }[]
}

const loading = ref(true)
const error = ref<string | null>(null)
const stats = ref<DashboardStats>({
  totalUsers: 0,
  totalOrders: 0,
  totalProducts: 0,
  revenue: 0,
  totalPromotionDiscount: 0,
  orderStatusCounts: {},
  recentOrders: [],
  salesData: [],
})

const recentOrders = computed(() => stats.value.recentOrders || [])
const statusCounts = computed(() => stats.value.orderStatusCounts || {})

const getRecentOrdersCount = computed(() => {
  return stats.value.recentOrders?.length || 0
})

const chartData = computed(() => {
  const sales = stats.value.salesData || []
  if (sales.length === 0) return []

  const maxRevenue = Math.max(...sales.map((s) => s.total), 1)

  return sales.map((day) => ({
    label: day._id?.slice(5) || '',
    revenue: day.total,
    percent: (day.total / maxRevenue) * 100,
  }))
})

onMounted(() => {
  fetchStats()
})

async function fetchStats() {
  loading.value = true
  error.value = null
  try {
    const data: any = await api.get('/users/stats')
    stats.value = data.stats || stats.value
  } catch (err: any) {
    error.value = err.message || 'Failed to load dashboard stats'
  } finally {
    loading.value = false
  }
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

function statusBgColor(status: string) {
  const map: Record<string, string> = {
    pending: '#FEF3C7',
    confirmed: '#DBEAFE',
    shipping: '#EDE9FE',
    delivered: '#D1FAE5',
    cancelled: '#FEE2E2',
  }
  return map[status] || '#F3F4F6'
}

function statusTextColor(status: string) {
  const map: Record<string, string> = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    shipping: '#8B5CF6',
    delivered: '#00C853',
    cancelled: '#EF4444',
  }
  return map[status] || '#6B7280'
}
</script>
