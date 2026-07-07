<template>
  <div
    class="group relative bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden border border-surface-100 dark:border-surface-700 hover:-translate-y-0.5"
    :class="{ 'opacity-60': isUsedOrExpired }"
  >
    <!-- Banner Image -->
    <div v-if="coupon.bannerImage" class="relative aspect-[3/1] overflow-hidden">
      <img :src="coupon.bannerImage.secure_url" :alt="coupon.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      <!-- Countdown overlay on banner -->          <div v-if="!isUsedOrExpired && timeRemaining.endsSoon" class="absolute top-2 right-2">
            <div class="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg animate-pulse flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ timeRemaining.display }}
            </div>
          </div>
    </div>

    <!-- Color Stripe -->
    <div v-else class="h-2" :style="{ background: coupon.themeColor || '#6366F1' }"></div>

    <div class="p-4 space-y-3">
      <!-- Top Row: Discount & Status -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-3">
          <!-- Discount Badge -->
          <div
            class="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-sm flex-shrink-0"
            :style="{ background: coupon.themeColor || '#6366F1' }"
          >
            <span class="text-lg leading-none">
              {{ coupon.discountType === 'percentage' ? coupon.discountValue + '%' : coupon.discountType === 'fixed' ? '$' + coupon.discountValue : (coupon.discountType === 'free_shipping' ? 'FREE' : '') }}
            </span>
            <span class="text-[10px] font-medium opacity-90 mt-0.5">
              {{ coupon.discountType === 'free_shipping' ? 'SHIP' : 'OFF' }}
            </span>
          </div>
          <div class="min-w-0">
            <h3 class="font-semibold text-surface-800 dark:text-white text-sm truncate">{{ coupon.name }}</h3>
            <code class="text-xs text-surface-400 font-mono">{{ coupon.code }}</code>
          </div>
        </div>
        <!-- Status Badge -->
        <span v-if="coupon.userStatus === 'used'"
          class="px-2 py-0.5 bg-surface-100 dark:bg-surface-700 text-surface-500 text-[11px] font-semibold rounded-full shrink-0">Used</span>
        <span v-else-if="coupon.userStatus === 'expired' || coupon.userStatus === 'exhausted'"
          class="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-500 text-[11px] font-semibold rounded-full shrink-0">{{ coupon.userStatus === 'exhausted' ? 'Exhausted' : 'Expired' }}</span>
        <span v-else-if="coupon.userStatus === 'upcoming'"
          class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-500 text-[11px] font-semibold rounded-full shrink-0">Upcoming</span>
        <span v-else-if="timeRemaining.endsSoon"
          class="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[11px] font-semibold rounded-full shrink-0 animate-pulse flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Ending
        </span>
      </div>

      <!-- Description -->
      <p v-if="coupon.description" class="text-xs text-surface-500 line-clamp-2">{{ coupon.description }}</p>

      <!-- Rules & Timer -->
      <div class="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-surface-400">
        <span v-if="coupon.minimumPurchase > 0" class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Min. ${{ coupon.minimumPurchase.toFixed(2) }}
        </span>
        <!-- Live countdown timer -->
        <span class="flex items-center gap-1" :class="{ 'text-amber-500 font-medium': timeRemaining.endsSoon }">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {{ timeRemaining.display }}
        </span>
        <!-- Usage indicator -->
        <span v-if="coupon.usageLimit > 0" class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          {{ coupon.usedCount }}/{{ coupon.usageLimit }}
        </span>
      </div>

      <!-- Progress Bar -->
      <div v-if="coupon.usageLimit > 0" class="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-1.5">
        <div class="h-1.5 rounded-full transition-all duration-500" 
          :style="{ width: Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100) + '%', background: coupon.themeColor || '#6366F1' }"></div>
      </div>

      <!-- Actions -->
      <div v-if="coupon.userStatus === 'available'" class="flex items-center gap-2 pt-1">
        <button @click="copyCode"
          class="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 rounded-lg text-xs font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-all active:scale-[0.98]">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <router-link :to="`/coupons/${coupon._id}`"
          class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold text-white transition-all active:scale-[0.98]"
          :style="{ background: coupon.themeColor || '#6366F1' }">
          <span>Details</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { CouponInfo } from '@/stores/coupon'

const props = defineProps<{
  coupon: CouponInfo
}>()

const copied = ref(false)
const now = ref(Date.now())
let timerInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timerInterval = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const isUsedOrExpired = computed(() =>
  props.coupon.userStatus === 'used' || props.coupon.userStatus === 'expired' || props.coupon.userStatus === 'exhausted'
)

const timeRemaining = computed(() => {
  const end = new Date(props.coupon.endDate).getTime()
  const diff = end - now.value

  if (diff <= 0) return { display: 'Expired', endsSoon: false }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  const endsSoon = days <= 1

  if (days > 0) {
    return {
      display: days === 1 ? '1 day left' : `${days}d ${hours}h left`,
      endsSoon,
    }
  }
  if (hours > 0) {
    return {
      display: `${hours}h ${minutes}m left`,
      endsSoon: true,
    }
  }
  return {
    display: `${minutes}m left`,
    endsSoon: true,
  }
})

function copyCode() {
  navigator.clipboard.writeText(props.coupon.code)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>
