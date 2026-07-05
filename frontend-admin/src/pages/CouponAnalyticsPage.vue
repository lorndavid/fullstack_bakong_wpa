<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('coupons.analytics') }}</h2>
          <p class="text-xs text-surface-400">{{ $t('coupons.analyticsDesc') }}</p>
        </div>
      </div>
      <router-link to="/coupons" class="px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-300 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-all">
        ← {{ $t('coupons.backToCoupons') }}
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-20">
      <div class="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-sm text-surface-500">{{ $t('common.loading') }}</p>
    </div>

    <template v-else-if="analytics">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <p class="text-sm text-surface-500 mb-1">{{ $t('coupons.totalCouponsShort') }}</p>
          <p class="text-2xl font-bold text-surface-800 dark:text-white">{{ analytics.totalCoupons }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <p class="text-sm text-surface-500 mb-1">{{ $t('coupons.activeCoupons') }}</p>
          <p class="text-2xl font-bold text-green-500">{{ analytics.activeCoupons }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <p class="text-sm text-surface-500 mb-1">{{ $t('coupons.expiredCoupons') }}</p>
          <p class="text-2xl font-bold text-red-500">{{ analytics.expiredCoupons }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <p class="text-sm text-surface-500 mb-1">{{ $t('coupons.totalRedemptions') }}</p>
          <p class="text-2xl font-bold text-purple-500">{{ analytics.totalUsed }}</p>
        </div>
      </div>

      <!-- Performance Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <p class="text-sm text-surface-500 mb-1">{{ $t('coupons.conversionRate') }}</p>
          <p class="text-xl font-bold text-surface-800 dark:text-white">{{ analytics.conversionRate }}%</p>
          <p class="text-xs text-surface-400 mt-1">{{ analytics.totalOrdersWithCoupon }} {{ $t('coupons.ordersWithCoupon') }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <p class="text-sm text-surface-500 mb-1">{{ $t('coupons.redemptionRate') }}</p>
          <p class="text-xl font-bold text-surface-800 dark:text-white">{{ analytics.redemptionRate }}%</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <p class="text-sm text-surface-500 mb-1">{{ $t('coupons.avgUsage') }}</p>
          <p class="text-xl font-bold text-surface-800 dark:text-white">{{ analytics.avgUsage }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <p class="text-sm text-surface-500 mb-1">{{ $t('coupons.avgPerCoupon') }}</p>
          <p class="text-xl font-bold text-surface-800 dark:text-white">{{ analytics.totalCoupons > 0 ? (analytics.totalUsed / analytics.totalCoupons).toFixed(1) : '0' }}</p>
        </div>
      </div>

      <!-- Daily Redemption Chart -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <h3 class="font-semibold text-surface-800 dark:text-white mb-4">{{ $t('coupons.dailyRedemption') }}</h3>
        <div v-if="analytics.dailyRedemption.length === 0" class="h-48 flex items-center justify-center text-surface-400 text-sm">
          {{ $t('coupons.noData') }}
        </div>
        <div v-else class="h-48 flex items-end gap-1.5 overflow-x-auto">
          <div v-for="(day, i) in dailyChart" :key="i" class="flex-1 min-w-[30px] flex flex-col items-center gap-1 group relative">
            <div class="w-full rounded-t-lg transition-all duration-250 hover:opacity-80 cursor-pointer relative"
              :style="{ height: day.percent + '%', background: 'linear-gradient(to top, #7C3AED, #A78BFA)' }">
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10">
                {{ day.count }} redemptions
              </div>
            </div>
            <span class="text-[10px] text-surface-400">{{ day.label }}</span>
          </div>
        </div>
      </div>

      <!-- Most Used Coupons -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <h3 class="font-semibold text-surface-800 dark:text-white mb-4">{{ $t('coupons.mostUsed') }}</h3>
        <div v-if="analytics.mostUsedCoupons.length === 0" class="text-center text-surface-400 text-sm py-8">
          {{ $t('coupons.noData') }}
        </div>
        <div v-else class="space-y-3">
          <div v-for="(coupon, i) in analytics.mostUsedCoupons" :key="coupon._id"
            class="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
            <span class="w-7 h-7 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-xs font-bold text-surface-500">#{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-surface-800 dark:text-white truncate">{{ coupon.name }}</p>
              <code class="text-xs text-surface-400 font-mono">{{ coupon.code }}</code>
            </div>
            <span class="text-sm font-bold text-surface-800 dark:text-white">{{ coupon.usedCount }}x</span>
          </div>
        </div>
      </div>

      <!-- Coupon Performance Table -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden border border-surface-100 dark:border-surface-700">
        <div class="px-5 py-4 border-b border-surface-200 dark:border-surface-700">
          <h3 class="font-semibold text-surface-800 dark:text-white">{{ $t('coupons.couponPerformance') }}</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <th class="px-4 py-3 text-left font-semibold text-surface-500">Name</th>
                <th class="px-4 py-3 text-left font-semibold text-surface-500">Code</th>
                <th class="px-4 py-3 text-right font-semibold text-surface-500">Discount</th>
                <th class="px-4 py-3 text-right font-semibold text-surface-500">Used</th>
                <th class="px-4 py-3 text-right font-semibold text-surface-500">Created</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
              <tr v-for="coupon in analytics.couponPerformance" :key="coupon._id" class="hover:bg-surface-50 dark:hover:bg-surface-700/50">
                <td class="px-4 py-3 font-medium text-surface-800 dark:text-white">{{ coupon.name }}</td>
                <td class="px-4 py-3"><code class="px-1.5 py-0.5 bg-surface-100 dark:bg-surface-700 text-xs font-mono rounded">{{ coupon.code }}</code></td>
                <td class="px-4 py-3 text-right text-surface-600 dark:text-surface-300">{{ coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '$' + coupon.discountValue }}</td>
                <td class="px-4 py-3 text-right font-bold text-surface-800 dark:text-white">{{ coupon.usedCount }}</td>
                <td class="px-4 py-3 text-right text-surface-400">{{ formatDate(coupon.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCouponStore } from '@/stores/coupon'

const store = useCouponStore()
const loading = ref(true)

const analytics = computed(() => store.analytics)

const dailyChart = computed(() => {
  if (!analytics.value?.dailyRedemption?.length) return []
  const maxVal = Math.max(...analytics.value.dailyRedemption.map((d: any) => d.count), 1)
  return analytics.value.dailyRedemption.map((d: any) => ({
    label: d._id?.slice(5) || '',
    count: d.count,
    percent: (d.count / maxVal) * 100,
  }))
})

onMounted(async () => {
  loading.value = true
  await store.fetchAnalytics()
  loading.value = false
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>
