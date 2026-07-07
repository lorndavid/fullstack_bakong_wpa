<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6" v-if="coupon">
    <router-link to="/coupons" class="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-200 mb-4 transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      Back to Coupons
    </router-link>

    <!-- Banner -->
    <div v-if="coupon.bannerImage" class="relative rounded-2xl overflow-hidden mb-6 shadow-lg">
      <img :src="coupon.bannerImage.secure_url" :alt="coupon.name" class="w-full aspect-video object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      <div class="absolute bottom-4 left-4 right-4 text-white">
        <span class="px-3 py-1 bg-white/20 backdrop-blur-sm text-xs font-semibold rounded-full mb-2 inline-block">{{ $t('coupons.limitedOffer') }}</span>
        <h1 class="text-2xl sm:text-3xl font-bold">{{ coupon.name }}</h1>
      </div>
    </div>

    <!-- Coupon Preview Card -->
    <div v-else class="relative rounded-2xl overflow-hidden mb-6 shadow-lg">
      <div class="p-8 sm:p-10 text-white text-center space-y-3" :style="{ background: coupon.themeColor || '#6366F1' }">
        <p class="text-5xl sm:text-6xl font-black">
          {{ coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : coupon.discountType === 'fixed' ? `$${coupon.discountValue}` : 'FREE' }}
        </p>
        <p class="text-2xl font-bold">{{ coupon.discountType === 'free_shipping' ? 'FREE SHIPPING' : 'OFF' }}</p>
        <p class="text-lg opacity-90">{{ coupon.name }}</p>
        <div class="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-lg font-mono font-bold tracking-widest">
          {{ coupon.code }}
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-6">
      <!-- Description -->
      <div v-if="coupon.description">
        <h3 class="font-semibold text-surface-800 dark:text-white mb-2">Description</h3>
        <p class="text-sm text-surface-600 dark:text-surface-300">{{ coupon.description }}</p>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div class="p-4 bg-surface-50 dark:bg-surface-700/30 rounded-xl">
          <p class="text-xs text-surface-400 mb-1">Discount</p>
          <p class="font-bold text-surface-800 dark:text-white">
            {{ coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : coupon.discountType === 'fixed' ? `$${coupon.discountValue.toFixed(2)}` : 'Free Shipping' }}
          </p>
        </div>
        <div class="p-4 bg-surface-50 dark:bg-surface-700/30 rounded-xl">
          <p class="text-xs text-surface-400 mb-1">Minimum Purchase</p>
          <p class="font-bold text-surface-800 dark:text-white">{{ coupon.minimumPurchase > 0 ? `$${coupon.minimumPurchase.toFixed(2)}` : 'No minimum' }}</p>
        </div>
        <div class="p-4 bg-surface-50 dark:bg-surface-700/30 rounded-xl">
          <p class="text-xs text-surface-400 mb-1">Valid From</p>
          <p class="font-bold text-surface-800 dark:text-white text-sm">{{ formatDate(coupon.startDate) }}</p>
        </div>
        <div class="p-4 bg-surface-50 dark:bg-surface-700/30 rounded-xl">
          <p class="text-xs text-surface-400 mb-1">Valid Until</p>
          <p class="font-bold text-surface-800 dark:text-white text-sm">{{ formatDate(coupon.endDate) }}</p>
        </div>
        <div class="p-4 bg-surface-50 dark:bg-surface-700/30 rounded-xl">
          <p class="text-xs text-surface-400 mb-1">Remaining</p>
          <p class="font-bold text-surface-800 dark:text-white">{{ remainingDays }}</p>
        </div>
        <div class="p-4 bg-surface-50 dark:bg-surface-700/30 rounded-xl">
          <p class="text-xs text-surface-400 mb-1">Usage</p>
          <p class="font-bold text-surface-800 dark:text-white">{{ coupon.usedCount }}{{ coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : '' }} used</p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="coupon.usageLimit > 0" class="space-y-1.5">
        <div class="flex justify-between text-xs">
          <span class="text-surface-400">Usage Progress</span>
          <span class="text-surface-500">{{ usagePercent }}%</span>
        </div>
        <div class="w-full bg-surface-200 dark:bg-surface-600 rounded-full h-2.5">
          <div class="h-2.5 rounded-full transition-all duration-500" :style="{ width: usagePercent + '%', background: coupon.themeColor || '#6366F1' }"></div>
        </div>
      </div>

      <!-- Rules -->
      <div class="space-y-2">
        <h3 class="font-semibold text-surface-800 dark:text-white">Rules</h3>
        <ul class="space-y-1.5 text-sm text-surface-600 dark:text-surface-300">
          <li class="flex items-center gap-2">
            <svg v-if="!coupon.newCustomerOnly" class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <svg v-else class="w-4 h-4 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            New customers only
          </li>
          <li class="flex items-center gap-2">
            <svg v-if="!coupon.firstOrderOnly" class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <svg v-else class="w-4 h-4 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            First order only
          </li>
          <li v-if="coupon.applicableProducts?.length > 0" class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            Applicable to specific products
          </li>
          <li v-if="coupon.applicableCategories?.length > 0" class="flex items-center gap-2">
            <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"/></svg>
            Applicable to specific categories
          </li>
          <li v-if="coupon.excludedProducts?.length > 0" class="flex items-center gap-2">
            <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
            Some products excluded
          </li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 pt-2">
        <button @click="copyCode"
          class="flex-1 flex items-center justify-center gap-2 py-3 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-xl text-sm font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 transition-all active:scale-[0.98]">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          {{ copied ? 'Copied!' : 'Copy Code' }}
        </button>
        <router-link to="/checkout"
          class="flex-1 flex items-center justify-center gap-2 py-3 text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
          :style="{ background: coupon.themeColor || '#6366F1' }">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/>
          </svg>
          Apply Now
        </router-link>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div v-else-if="loading" class="text-center py-20">
    <div class="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    <p class="mt-2 text-sm text-surface-500">Loading coupon...</p>
  </div>

  <!-- Error -->
  <div v-else class="text-center py-20">
    <p class="text-surface-500 mb-3">Coupon not found</p>
    <router-link to="/coupons" class="text-purple-500 hover:text-purple-600 text-sm">← Back to Coupons</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import type { CouponInfo } from '@/stores/coupon'

const route = useRoute()
const coupon = ref<CouponInfo | null>(null)
const loading = ref(true)
const copied = ref(false)

const usagePercent = computed(() => {
  if (!coupon.value || coupon.value.usageLimit <= 0) return 0
  return Math.min(100, Math.round((coupon.value.usedCount / coupon.value.usageLimit) * 100))
})

const remainingDays = computed(() => {
  if (!coupon.value) return ''
  const now = new Date()
  const end = new Date(coupon.value.endDate)
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Expired'
  if (diff === 0) return 'Ends today'
  if (diff === 1) return '1 day left'
  return `${diff} days left`
})

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    try {
      const data: any = await api.get(`/coupons/code/${id}`)
      coupon.value = data.coupon
    } catch {
      try {
        const data: any = await api.get(`/coupons/code/${id}`)
        coupon.value = data.coupon
      } catch {}
    }
    loading.value = false
  }
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function copyCode() {
  if (!coupon.value) return
  navigator.clipboard.writeText(coupon.value.code)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>
