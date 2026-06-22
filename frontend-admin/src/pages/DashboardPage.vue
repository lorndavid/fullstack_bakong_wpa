<template>
  <div class="space-y-6">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-surface-500">{{ stat.label }}</span>
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ background: stat.bgColor }">
            <svg class="w-5 h-5" :style="{ color: stat.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="stat.icon"></svg>
          </div>
        </div>
        <p class="text-2xl font-bold text-surface-800 dark:text-white">{{ stat.value }}</p>
        <p class="text-xs text-surface-400 mt-1">{{ stat.change }}</p>
      </div>
    </div>

    <!-- Charts & Recent Orders -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Chart -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <h3 class="font-semibold text-surface-800 dark:text-white mb-4">Revenue (Last 30 Days)</h3>
        <div class="h-64 flex items-end gap-2">
          <div v-for="(day, i) in chartData" :key="i" class="flex-1 flex flex-col items-center gap-1 group relative">
            <div class="w-full rounded-t-lg transition-all duration-250 group-hover:opacity-80"
              :style="{ height: day.percent + '%', background: day.color }"></div>
            <span class="text-[10px] text-surface-400">{{ day.label }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-surface-800 dark:text-white">Recent Orders</h3>
          <router-link to="/orders" class="text-sm text-primary-500 hover:text-primary-600">View All</router-link>
        </div>
        <div class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-700 last:border-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center text-xs font-bold text-surface-500">
                #{{ i }}
              </div>
              <div>
                <p class="text-sm font-medium text-surface-800 dark:text-white">Order #ABC{{ 1000 + i }}</p>
                <p class="text-xs text-surface-400">${{ (19.99 * i).toFixed(2) }}</p>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Confirmed</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Status Distribution -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
      <h3 class="font-semibold text-surface-800 dark:text-white mb-4">Order Status</h3>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div v-for="status in orderStatuses" :key="status.label" class="text-center p-4 rounded-xl" :style="{ background: status.bg }">
          <p class="text-2xl font-bold" :style="{ color: status.color }">{{ status.count }}</p>
          <p class="text-xs text-surface-500 mt-1">{{ status.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const stats = [
  { label: 'Total Revenue', value: '$12,845', change: '+12.5% from last month', color: '#00C853', bgColor: '#E6FFE6', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
  { label: 'Total Orders', value: '324', change: '+8.2% from last month', color: '#0055A4', bgColor: '#E6F0FF', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>' },
  { label: 'Total Products', value: '156', change: '+3 new this week', color: '#7C3AED', bgColor: '#F3E8FF', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>' },
  { label: 'Total Users', value: '892', change: '+18 new this week', color: '#F59E0B', bgColor: '#FEF3C7', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>' },
]

const chartData = Array.from({ length: 14 }, (_, i) => ({
  label: `D${i + 1}`,
  percent: 20 + Math.random() * 80,
  color: i === 13 ? '#0055A4' : '#93C5FD',
}))

const orderStatuses = [
  { label: 'Pending', count: 23, color: '#F59E0B', bg: '#FEF3C7' },
  { label: 'Confirmed', count: 45, color: '#3B82F6', bg: '#DBEAFE' },
  { label: 'Shipping', count: 18, color: '#8B5CF6', bg: '#EDE9FE' },
  { label: 'Delivered', count: 198, color: '#00C853', bg: '#D1FAE5' },
  { label: 'Cancelled', count: 12, color: '#EF4444', bg: '#FEE2E2' },
]
</script>
