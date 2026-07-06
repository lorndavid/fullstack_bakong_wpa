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
        <h1 class="text-xl sm:text-2xl font-bold text-surface-800 dark:text-white">{{ $t('coupons.title') }}</h1>
        <p class="text-sm text-surface-400">{{ $t('coupons.titleDesc') }}</p>
      </div>
    </div>

    <!-- Search & Sort Bar -->
    <div class="flex items-center gap-2 mb-4">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="searchQuery" type="text" :placeholder="$t('coupons.searchPlaceholder')"
          class="w-full pl-9 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 transition-all" />
      </div>
      <select v-model="sortBy"
        class="px-3 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-purple-500/50 transition-all">
        <option value="priority">{{ $t('coupons.sortBest') }}</option>
        <option value="value">{{ $t('coupons.sortValue') }}</option>
        <option value="expiry">{{ $t('coupons.sortExpiry') }}</option>
        <option value="name">{{ $t('coupons.sortName') }}</option>
      </select>
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
        <span v-if="filteredCounts[tab.key] > 0"
          class="ml-1.5 px-1.5 py-0.5 text-[11px] font-bold rounded-full"
          :class="store.activeTab === tab.key
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            : 'bg-surface-200 dark:bg-surface-600 text-surface-500'"
        >
          {{ filteredCounts[tab.key] }}
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

    <!-- Empty states per tab -->
    <div v-else-if="filteredCoupons.length === 0" class="text-center py-16">
      <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">
        {{ searchQuery ? $t('coupons.noSearchResults') : emptyMessages[store.activeTab] }}
      </h3>
      <p v-if="!searchQuery" class="text-sm text-surface-400 mb-4">{{ $t('coupons.noCouponsDesc') }}</p>
      <router-link v-if="!searchQuery" to="/" class="inline-flex px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-all">{{ $t('coupons.browseProducts') }}</router-link>
      <button v-else @click="searchQuery = ''" class="inline-flex px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-all">{{ $t('common.clear') }}</button>
    </div>

    <!-- Coupons Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <CouponCard v-for="coupon in filteredCoupons" :key="coupon._id" :coupon="coupon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCouponStore } from '@/stores/coupon'
import CouponCard from '@/components/coupon/CouponCard.vue'

const { t } = useI18n()
const store = useCouponStore()

const searchQuery = ref('')
const sortBy = ref('priority')

const tabs = [
  { key: 'available' as const, label: 'Available' },
  { key: 'used' as const, label: 'Used' },
  { key: 'expired' as const, label: 'Expired' },
  { key: 'upcoming' as const, label: 'Upcoming' },
]

const emptyMessages: Record<string, string> = {
  available: t('coupons.noCoupons'),
  used: t('coupons.noUsedCoupons'),
  expired: t('coupons.noExpiredCoupons'),
  upcoming: t('coupons.noUpcomingCoupons'),
}

const activeList = computed(() => {
  const map: Record<string, any[]> = {
    available: store.available,
    used: store.used,
    expired: store.expired,
    upcoming: store.upcoming,
  }
  const list = map[store.activeTab] || []
  return [...list]
})

const filteredCoupons = computed(() => {
  let list = activeList.value

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q) || 
      (c.description && c.description.toLowerCase().includes(q))
    )
  }

  // Sort
  switch (sortBy.value) {
    case 'value':
      list.sort((a, b) => b.discountValue - a.discountValue)
      break
    case 'expiry':
      list.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      break
    case 'name':
      list.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'priority':
    default:
      list.sort((a, b) => (b.priority || 0) - (a.priority || 0))
      break
  }

  return list
})

const filteredCounts = computed(() => {
  const map: Record<string, any[]> = {
    available: store.available,
    used: store.used,
    expired: store.expired,
    upcoming: store.upcoming,
  }
  const result: Record<string, number> = {}
  for (const [key, list] of Object.entries(map)) {
    let filtered = [...list]
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.code.toLowerCase().includes(q) || 
        (c.description && c.description.toLowerCase().includes(q))
      )
    }
    result[key] = filtered.length
  }
  return result
})

onMounted(() => {
  store.fetchCoupons()
})
</script>
