<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('coupons.title') }}</h2>
          <p class="text-xs text-surface-400">{{ store.total }} {{ $t('coupons.totalCoupons') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <router-link to="/coupons/analytics"
          class="px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-300 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-all">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          {{ $t('coupons.analytics') }}
        </router-link>
        <button @click="openCreatePanel"
          class="px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-all flex items-center gap-2 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          {{ $t('coupons.addCoupon') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-2">
      <div class="relative flex-1 min-w-[200px] max-w-sm">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="searchQuery" @input="debouncedSearch" type="text" :placeholder="$t('common.search')"
          class="w-full pl-10 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-500/50 transition-all" />
      </div>
      <select v-model="statusFilter" @change="applyFilters"
        class="px-3 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-500/50">
        <option value="">{{ $t('coupons.allStatus') }}</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="expired">Expired</option>
      </select>
      <select v-model="typeFilter" @change="applyFilters"
        class="px-3 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-500/50">
        <option value="">{{ $t('coupons.allTypes') }}</option>
        <option value="percentage">Percentage</option>
        <option value="fixed">Fixed</option>
        <option value="free_shipping">Free Shipping</option>
      </select>
      <select v-model="sortFilter" @change="applyFilters"
        class="px-3 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-500/50">
        <option value="">{{ $t('coupons.sortBy') }}</option>
        <option value="name">Name A-Z</option>
        <option value="usage">Most Used</option>
        <option value="priority">Priority</option>
        <option value="endDate">Expiring Soon</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <div class="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-sm text-surface-500">{{ $t('common.loading') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <p class="text-red-500 text-sm mb-3">{{ store.error }}</p>
      <button @click="store.fetchCoupons()" class="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="store.coupons.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">{{ $t('coupons.noCoupons') }}</h3>
      <p class="text-sm text-surface-500 mb-4">{{ $t('coupons.noCouponsDesc') }}</p>
      <button @click="openCreatePanel" class="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg">{{ $t('coupons.addCoupon') }}</button>
    </div>

    <!-- Coupons Table -->
    <div v-else class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden border border-surface-100 dark:border-surface-700">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="px-4 py-3 text-left font-semibold text-surface-600 dark:text-surface-300">{{ $t('coupons.couponName') }}</th>
              <th class="px-4 py-3 text-left font-semibold text-surface-600 dark:text-surface-300">{{ $t('coupons.code') }}</th>
              <th class="px-4 py-3 text-left font-semibold text-surface-600 dark:text-surface-300">{{ $t('coupons.discount') }}</th>
              <th class="px-4 py-3 text-center font-semibold text-surface-600 dark:text-surface-300">{{ $t('coupons.usage') }}</th>
              <th class="px-4 py-3 text-center font-semibold text-surface-600 dark:text-surface-300">{{ $t('coupons.status') }}</th>
              <th class="px-4 py-3 text-left font-semibold text-surface-600 dark:text-surface-300">{{ $t('coupons.validity') }}</th>
              <th class="px-4 py-3 text-left font-semibold text-surface-600 dark:text-surface-300">{{ $t('coupons.createdBy') }}</th>
              <th class="px-4 py-3 text-right font-semibold text-surface-600 dark:text-surface-300">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
            <tr v-for="coupon in store.coupons" :key="coupon._id"
              class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" :style="{ background: coupon.themeColor }">
                    <span>%</span>
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-surface-800 dark:text-white truncate max-w-[180px]">{{ coupon.name }}</p>
                    <p v-if="coupon.autoApply" class="text-[11px] text-purple-500 font-medium">⚡ Auto Apply</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <code class="px-2 py-1 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-200 text-xs font-mono font-bold rounded">{{ coupon.code }}</code>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                  :class="discountTypeClass(coupon.discountType)">
                  <template v-if="coupon.discountType === 'percentage'">{{ coupon.discountValue }}% OFF</template>
                  <template v-else-if="coupon.discountType === 'fixed'">${{ coupon.discountValue.toFixed(2) }} OFF</template>
                  <template v-else>🚚 Free Shipping</template>
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="text-xs text-surface-500">
                  {{ coupon.usedCount }}{{ coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : '' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="statusClass(coupon.status)">
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(coupon.status)"></span>
                  {{ coupon.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs text-surface-500">
                  {{ formatDate(coupon.startDate) }} — {{ formatDate(coupon.endDate) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs text-surface-500">{{ coupon.createdBy?.name || '—' }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button @click="viewCoupon(coupon)" class="p-1.5 text-surface-400 hover:text-primary-500 transition-colors" :title="$t('common.edit')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                  <button @click="openEditPanel(coupon)" class="p-1.5 text-surface-400 hover:text-primary-500 transition-colors" :title="$t('common.edit')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="confirmDelete(coupon)" class="p-1.5 text-surface-400 hover:text-red-500 transition-colors" :title="$t('common.delete')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div v-if="store.pages > 1" class="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
        <p class="text-xs text-surface-400">{{ $t('common.showing') }} {{ store.coupons.length }} {{ $t('common.of') }} {{ store.total }}</p>
        <div class="flex gap-1">
          <button @click="changePage(store.page - 1)" :disabled="store.page <= 1"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {{ $t('common.previous') }}
          </button>
          <span class="px-3 py-1.5 text-xs font-medium text-surface-500">{{ $t('common.page') }} {{ store.page }} {{ $t('common.of') }} {{ store.pages }}</span>
          <button @click="changePage(store.page + 1)" :disabled="store.page >= store.pages"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {{ $t('common.next') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Slide-in Panel -->
    <CouponFormPanel
      :visible="showPanel"
      :coupon="editingCoupon"
      @close="closePanel"
      @saved="onSaved"
    />

    <!-- Delete Confirmation -->
    <div v-if="deletingCoupon" class="fixed inset-0 z-50">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="deletingCoupon = null"></div>
      <div class="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-surface-800 shadow-2xl animate-slide-in-right flex flex-col">
        <div class="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
          </div>
          <h3 class="text-xl font-bold text-surface-800 dark:text-white mb-2">{{ $t('coupons.deleteTitle') }}</h3>
          <p class="text-sm text-surface-500 mb-8" v-html="`${$t('coupons.deleteDesc')} <strong>${deletingCoupon.name}</strong>`"></p>
        </div>
        <div class="flex items-center gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <button @click="deletingCoupon = null" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-surface-700 transition-all">{{ $t('common.cancel') }}</button>
          <button @click="handleDelete" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-all shadow-sm">{{ deleting ? $t('common.deleting') : $t('common.delete') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCouponStore, type Coupon } from '@/stores/coupon'
import CouponFormPanel from './CouponFormPanel.vue'

const router = useRouter()
const store = useCouponStore()

const showPanel = ref(false)
const editingCoupon = ref<Coupon | null>(null)
const deletingCoupon = ref<Coupon | null>(null)
const deleting = ref(false)

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const sortFilter = ref('')

let searchTimeout: ReturnType<typeof setTimeout>

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => applyFilters(), 400)
}

function applyFilters() {
  store.fetchCoupons(1, {
    search: searchQuery.value,
    status: statusFilter.value,
    discountType: typeFilter.value,
    sort: sortFilter.value,
  })
}

function changePage(p: number) {
  store.fetchCoupons(p, {
    search: searchQuery.value,
    status: statusFilter.value,
    discountType: typeFilter.value,
    sort: sortFilter.value,
  })
}

function openCreatePanel() {
  editingCoupon.value = null
  showPanel.value = true
}

function openEditPanel(coupon: Coupon) {
  editingCoupon.value = coupon
  showPanel.value = true
}

function closePanel() {
  showPanel.value = false
  editingCoupon.value = null
}

function onSaved() {
  closePanel()
  store.fetchCoupons(store.page, { search: searchQuery.value, status: statusFilter.value, discountType: typeFilter.value, sort: sortFilter.value })
}

function viewCoupon(coupon: Coupon) {
  router.push(`/coupons/${coupon._id}`)
}

function confirmDelete(coupon: Coupon) {
  deletingCoupon.value = coupon
}

async function handleDelete() {
  if (!deletingCoupon.value) return
  deleting.value = true
  try {
    await store.deleteCoupon(deletingCoupon.value._id)
    deletingCoupon.value = null
    await store.fetchCoupons(store.page, { search: searchQuery.value, status: statusFilter.value, discountType: typeFilter.value, sort: sortFilter.value })
  } catch {}
  deleting.value = false
}

onMounted(() => {
  store.fetchCoupons()
})

function statusClass(status: string) {
  const map: Record<string, string> = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    inactive: 'bg-surface-100 dark:bg-surface-700 text-surface-500',
    expired: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  }
  return map[status] || 'bg-surface-100 text-surface-500'
}

function statusDotClass(status: string) {
  const map: Record<string, string> = {
    active: 'bg-green-500',
    inactive: 'bg-surface-400',
    expired: 'bg-red-500',
  }
  return map[status] || 'bg-surface-400'
}

function discountTypeClass(type: string) {
  const map: Record<string, string> = {
    percentage: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    fixed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    free_shipping: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  }
  return map[type] || 'bg-surface-100 text-surface-500'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

</script>

<style scoped>
.animate-slide-in-right {
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
