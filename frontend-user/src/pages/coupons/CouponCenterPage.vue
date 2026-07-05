<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
      </div>
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-surface-800 dark:text-white">My Coupons</h1>
        <p class="text-sm text-surface-400">View and use your available coupons</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="store.activeTab = tab.key"
        class="relative px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap"
        :class="store.activeTab === tab.key
          ? 'bg-white dark:bg-surface-700 text-purple-600 dark:text-purple-400 shadow-sm'
          : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-200'"
      >
        {{ tab.label }}
        <span v-if="store.tabCounts[tab.key] > 0"
          class="ml-1.5 px-1.5 py-0.5 text-[11px] font-bold rounded-full"
          :class="store.activeTab === tab.key
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            : 'bg-surface-200 dark:bg-surface-600 text-surface-500'"
        >
          {{ store.tabCounts[tab.key] }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card animate-pulse">
        <div class="flex gap-4">
          <div class="w-16 h-16 bg-surface-200 dark:bg-surface-700 rounded-xl"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4"></div>
            <div class="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/2"></div>
            <div class="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Coupons -->
    <template v-else-if="store.activeTab === 'available'">
      <div v-if="store.available.length === 0" class="text-center py-16">
        <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
        <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">No coupons available</h3>
        <p class="text-sm text-surface-400 mb-4">Check back later for new deals and promotions</p>
        <router-link to="/" class="inline-flex px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-all">Browse Products</router-link>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CouponCard v-for="coupon in store.available" :key="coupon._id" :coupon="coupon" />
      </div>
    </template>

    <!-- Used Coupons -->
    <template v-else-if="store.activeTab === 'used'">
      <div v-if="store.used.length === 0" class="text-center py-16">
        <p class="text-surface-400 text-sm">You haven't used any coupons yet.</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CouponCard v-for="coupon in store.used" :key="coupon._id" :coupon="coupon" />
      </div>
    </template>

    <!-- Expired Coupons -->
    <template v-else-if="store.activeTab === 'expired'">
      <div v-if="store.expired.length === 0" class="text-center py-16">
        <p class="text-surface-400 text-sm">No expired coupons.</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CouponCard v-for="coupon in store.expired" :key="coupon._id" :coupon="coupon" />
      </div>
    </template>

    <!-- Upcoming Coupons -->
    <template v-else-if="store.activeTab === 'upcoming'">
      <div v-if="store.upcoming.length === 0" class="text-center py-16">
        <p class="text-surface-400 text-sm">No upcoming coupons.</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CouponCard v-for="coupon in store.upcoming" :key="coupon._id" :coupon="coupon" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCouponStore } from '@/stores/coupon'
import CouponCard from '@/components/coupon/CouponCard.vue'

const store = useCouponStore()

const tabs = [
  { key: 'available' as const, label: 'Available' },
  { key: 'used' as const, label: 'Used' },
  { key: 'expired' as const, label: 'Expired' },
  { key: 'upcoming' as const, label: 'Upcoming' },
]

onMounted(() => {
  store.fetchCoupons()
})
</script>
