<template>
  <div class="space-y-6" v-if="coupon">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <router-link to="/coupons" class="p-2 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </router-link>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" :style="{ background: coupon.themeColor }">%</div>
        <div>
          <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ coupon.name }}</h2>
          <code class="text-sm text-surface-400 font-mono">{{ coupon.code }}</code>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1.5 rounded-full text-xs font-semibold" :class="statusClass(coupon.status)">{{ coupon.status }}</span>
        <button @click="toggleStatus" class="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-all">
          {{ coupon.status === 'active' ? 'Deactivate' : 'Activate' }}
        </button>
        <button @click="copyCode" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-all">
          {{ copied ? 'Copied!' : 'Copy Code' }}
        </button>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Info Card -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <h3 class="font-semibold text-surface-800 dark:text-white mb-4">Coupon Details</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-surface-400 mb-0.5">Discount Type</p>
              <p class="font-medium text-surface-800 dark:text-white capitalize">{{ coupon.discountType }}</p>
            </div>
            <div>
              <p class="text-surface-400 mb-0.5">Discount Value</p>
              <p class="font-medium text-surface-800 dark:text-white">{{ coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '$' + coupon.discountValue }}</p>
            </div>
            <div>
              <p class="text-surface-400 mb-0.5">Minimum Purchase</p>
              <p class="font-medium text-surface-800 dark:text-white">${{ coupon.minimumPurchase.toFixed(2) }}</p>
            </div>
            <div v-if="coupon.discountType === 'percentage'">
              <p class="text-surface-400 mb-0.5">Maximum Discount</p>
              <p class="font-medium text-surface-800 dark:text-white">{{ coupon.maximumDiscount > 0 ? '$' + coupon.maximumDiscount.toFixed(2) : 'No limit' }}</p>
            </div>
            <div>
              <p class="text-surface-400 mb-0.5">Usage</p>
              <p class="font-medium text-surface-800 dark:text-white">{{ coupon.usedCount }} / {{ coupon.usageLimit > 0 ? coupon.usageLimit : '∞' }}</p>
            </div>
            <div>
              <p class="text-surface-400 mb-0.5">Per User Limit</p>
              <p class="font-medium text-surface-800 dark:text-white">{{ coupon.limitPerUser }}</p>
            </div>
            <div>
              <p class="text-surface-400 mb-0.5">Priority</p>
              <p class="font-medium text-surface-800 dark:text-white">{{ coupon.priority }}</p>
            </div>
            <div>
              <p class="text-surface-400 mb-0.5">Created By</p>
              <p class="font-medium text-surface-800 dark:text-white">{{ coupon.createdBy?.name || '—' }}</p>
            </div>
          </div>
          <div v-if="coupon.description" class="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700">
            <p class="text-surface-400 text-sm mb-1">Description</p>
            <p class="text-sm text-surface-700 dark:text-surface-200">{{ coupon.description }}</p>
          </div>
        </div>

        <!-- Rules & Restrictions -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <h3 class="font-semibold text-surface-800 dark:text-white mb-4">Rules & Restrictions</h3>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex items-center gap-2">
              <span :class="coupon.autoApply ? 'text-green-500' : 'text-surface-300'">{{ coupon.autoApply ? '✅' : '❌' }}</span>
              <span class="text-surface-600 dark:text-surface-300">Auto Apply</span>
            </div>
            <div class="flex items-center gap-2">
              <span :class="coupon.stackable ? 'text-green-500' : 'text-surface-300'">{{ coupon.stackable ? '✅' : '❌' }}</span>
              <span class="text-surface-600 dark:text-surface-300">Stackable</span>
            </div>
            <div class="flex items-center gap-2">
              <span :class="coupon.newCustomerOnly ? 'text-green-500' : 'text-surface-300'">{{ coupon.newCustomerOnly ? '✅' : '❌' }}</span>
              <span class="text-surface-600 dark:text-surface-300">New Customers Only</span>
            </div>
            <div class="flex items-center gap-2">
              <span :class="coupon.firstOrderOnly ? 'text-green-500' : 'text-surface-300'">{{ coupon.firstOrderOnly ? '✅' : '❌' }}</span>
              <span class="text-surface-600 dark:text-surface-300">First Order Only</span>
            </div>
            <div class="flex items-center gap-2">
              <span :class="coupon.allowGuest ? 'text-green-500' : 'text-surface-300'">{{ coupon.allowGuest ? '✅' : '❌' }}</span>
              <span class="text-surface-600 dark:text-surface-300">Allow Guest</span>
            </div>
            <div class="flex items-center gap-2">
              <span :class="coupon.isHighlighted ? 'text-green-500' : 'text-surface-300'">{{ coupon.isHighlighted ? '✅' : '❌' }}</span>
              <span class="text-surface-600 dark:text-surface-300">Featured/Highlighted</span>
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <h3 class="font-semibold text-surface-800 dark:text-white mb-4">Validity Period</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-surface-400 mb-0.5">Start Date</p>
              <p class="font-medium text-surface-800 dark:text-white">{{ formatFullDate(coupon.startDate) }}</p>
            </div>
            <div>
              <p class="text-surface-400 mb-0.5">End Date</p>
              <p class="font-medium text-surface-800 dark:text-white">{{ formatFullDate(coupon.endDate) }}</p>
            </div>
          </div>
          <div class="mt-2 text-xs text-surface-400">Created on {{ formatFullDate(coupon.createdAt) }}</div>
        </div>
      </div>

      <!-- Right: Banner & Analytics Link -->
      <div class="space-y-6">
        <!-- Banner -->
        <div v-if="coupon.bannerImage" class="bg-white dark:bg-surface-800 rounded-2xl overflow-hidden shadow-card">
          <img :src="coupon.bannerImage.secure_url" :alt="coupon.name" class="w-full aspect-video object-cover" />
        </div>
        <div v-else class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card text-center">
          <div class="w-full aspect-video rounded-xl flex items-center justify-center" :style="{ background: coupon.themeColor + '20' }">
            <span class="text-4xl" :style="{ color: coupon.themeColor }">🎟️</span>
          </div>
        </div>

        <!-- Analytics Quick View -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <h3 class="font-semibold text-surface-800 dark:text-white mb-3">Usage Analytics</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-surface-400">Total Used</span>
              <span class="font-bold text-surface-800 dark:text-white">{{ coupon.usedCount }}x</span>
            </div>
            <div class="flex justify-between">
              <span class="text-surface-400">Status</span>
              <span class="font-semibold capitalize" :class="coupon.status === 'active' ? 'text-green-500' : coupon.status === 'expired' ? 'text-red-500' : 'text-surface-500'">{{ coupon.status }}</span>
            </div>
            <div class="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-2">
              <div class="h-2 rounded-full transition-all" :style="{ width: usagePercent + '%', background: coupon.themeColor }"></div>
            </div>
            <p class="text-xs text-surface-400 text-center">{{ coupon.usageLimit > 0 ? usagePercent + '% used' : 'Unlimited usage' }}</p>
          </div>
        </div>

        <!-- Edit Button -->
        <button @click="editCoupon" class="w-full py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all shadow-sm">
          Edit Coupon
        </button>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div v-else-if="loading" class="text-center py-20">
    <div class="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    <p class="mt-2 text-sm text-surface-500">{{ $t('common.loading') }}</p>
  </div>

  <!-- Error -->
  <div v-else class="text-center py-20">
    <p class="text-red-500 mb-3">Coupon not found</p>
    <router-link to="/coupons" class="text-purple-500 hover:text-purple-600 text-sm">← Back to Coupons</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCouponStore, type Coupon } from '@/stores/coupon'

const route = useRoute()
const router = useRouter()
const store = useCouponStore()

const coupon = ref<Coupon | null>(null)
const loading = ref(true)
const copied = ref(false)

const usagePercent = computed(() => {
  if (!coupon.value || coupon.value.usageLimit <= 0) return 0
  return Math.min(100, Math.round((coupon.value.usedCount / coupon.value.usageLimit) * 100))
})

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    coupon.value = await store.fetchCoupon(id)
    loading.value = false
  }
})

function statusClass(status: string) {
  const map: Record<string, string> = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    inactive: 'bg-surface-100 dark:bg-surface-700 text-surface-500',
    expired: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  }
  return map[status] || ''
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

async function toggleStatus() {
  if (!coupon.value) return
  const newStatus = coupon.value.status === 'active' ? 'inactive' : 'active'
  await store.updateCouponStatus(coupon.value._id, newStatus)
  coupon.value.status = newStatus
}

function copyCode() {
  if (!coupon.value) return
  navigator.clipboard.writeText(coupon.value.code)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

function editCoupon() {
  router.push(`/coupons?edit=${coupon.value?._id}`)
}
</script>
