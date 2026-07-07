<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('inventory.stockMovement') }}</h2>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button @click="resetFilters" class="px-3 py-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 border border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
          <span class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            {{ $t('stockMovement.resetFilters') }}
          </span>
        </button>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Type Filter -->
        <div>
          <label class="block text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-1">{{ $t('stockMovement.type') }}</label>
          <select v-model="filters.type" @change="onFilterChange"
            class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50">
            <option value="all">{{ $t('common.allStatus') }}</option>
            <option value="stock_in">Stock In</option>
            <option value="stock_out">Stock Out</option>
            <option value="adjustment">Adjustment</option>
            <option value="customer_order">Customer Order</option>
            <option value="order_cancelled">Order Cancelled</option>
            <option value="purchase_received">Purchase Received</option>
            <option value="transfer">Transfer</option>
            <option value="return">Return</option>
            <option value="damaged">Damaged</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <!-- Product Search -->
        <div class="relative">
          <label class="block text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-1">{{ $t('products.product') }}</label>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="filters.productSearch"
              type="text"
              :placeholder="$t('stockMovement.searchProduct')"
              class="w-full pl-10 pr-4 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
        </div>

        <!-- Warehouse Filter -->
        <div>
          <label class="block text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-1">{{ $t('nav.warehouses') }}</label>
          <select v-model="filters.warehouseId" @change="onFilterChange"
            class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50">
            <option value="all">{{ $t('stockMovement.allWarehouses') }}</option>
            <option v-for="w in warehouses" :key="w._id" :value="w._id">{{ w.name }}</option>
          </select>
        </div>

        <!-- Start Date -->
        <div>
          <label class="block text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-1">{{ $t('stockMovement.from') }}</label>
          <input
            v-model="filters.startDate"
            type="date"
            @change="onFilterChange"
            class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>

        <!-- End Date -->
        <div>
          <label class="block text-[11px] font-medium text-surface-400 uppercase tracking-wider mb-1">{{ $t('stockMovement.to') }}</label>
          <input
            v-model="filters.endDate"
            type="date"
            @change="onFilterChange"
            class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && movements.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-3 text-sm text-surface-500">{{ $t('common.loading') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <p class="text-red-500 text-sm mb-3">{{ error }}</p>
      <button @click="fetchMovements" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="movements.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">{{ $t('stockMovement.noMovements') }}</h3>
      <p class="text-sm text-surface-500">{{ $t('stockMovement.noMovementsDesc') }}</p>
    </div>

    <!-- Movements Table -->
    <div v-else class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('stockMovement.type') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('products.product') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('nav.warehouses') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('stockMovement.quantity') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('stockMovement.stockChange') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('stockMovement.reason') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('stockMovement.reference') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('orders.date') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
            <tr v-for="m in movements" :key="m._id" class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
              <!-- Type Badge -->
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" :class="typeBadgeClass(m.type)">
                  <span v-html="typeIcon(m.type)"></span>
                  {{ typeLabel(m.type) }}
                </span>
              </td>
              <!-- Product -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-700 flex-shrink-0 border border-surface-200 dark:border-surface-600">
                    <img v-if="m.product?.images?.[0]" :src="m.product.images[0].secure_url" :alt="m.product.name" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    </div>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-surface-800 dark:text-white truncate max-w-[180px]">{{ m.product?.name || 'Unknown Product' }}</p>
                    <p v-if="m.product?.sku" class="text-[11px] text-surface-400 font-mono">{{ m.product.sku }}</p>
                  </div>
                </div>
              </td>
              <!-- Warehouse -->
              <td class="px-4 py-3">
                <span class="text-sm text-surface-600 dark:text-surface-300">{{ m.warehouse?.name || '—' }}</span>
              </td>
              <!-- Quantity -->
              <td class="px-4 py-3">
                <span class="text-sm font-bold" :class="quantityClass(m.type)">
                  {{ m.type === 'stock_in' || m.type === 'purchase_received' || m.type === 'return' || m.type === 'order_cancelled' ? '+' : '-' }}{{ m.quantity }}
                </span>
              </td>
              <!-- Stock Change -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs text-surface-400 bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded font-mono">{{ m.oldStock }}</span>
                  <svg class="w-3 h-3 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                  <span class="text-xs font-bold font-mono" :class="stockChangeClass(m.oldStock, m.newStock)">{{ m.newStock }}</span>
                </div>
              </td>
              <!-- Reason -->
              <td class="px-4 py-3">
                <p class="text-sm text-surface-600 dark:text-surface-300 max-w-[200px] truncate" :title="m.reason">{{ m.reason || '—' }}</p>
                <p v-if="m.user" class="text-[11px] text-surface-400">{{ m.user?.name || 'System' }}</p>
              </td>
              <!-- Reference -->
              <td class="px-4 py-3">
                <span v-if="m.referenceNumber" class="font-mono text-xs text-surface-500 bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded">
                  #{{ m.referenceNumber.slice(-8).toUpperCase() }}
                </span>
                <span v-else class="text-xs text-surface-400">—</span>
              </td>
              <!-- Date -->
              <td class="px-4 py-3 text-sm text-surface-500 whitespace-nowrap">{{ formatDate(m.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
        <p class="text-xs text-surface-500">
          {{ $t('stockMovement.showingOf', { count: movements.length, total: pagination.total }) }}
        </p>
        <div class="flex items-center gap-1">
          <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1"
            class="px-3 py-1.5 text-xs rounded-lg border border-surface-200 dark:border-surface-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            {{ $t('common.previous') }}
          </button>
          <template v-for="p in visiblePages" :key="p">
            <button v-if="p === -1" disabled class="px-2 py-1.5 text-xs text-surface-400">...</button>
            <button v-else @click="goToPage(p)"
              class="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
              :class="p === pagination.page
                ? 'bg-primary-500 text-white'
                : 'border border-surface-200 dark:border-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700'">
              {{ p }}
            </button>
          </template>
          <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page >= pagination.pages"
            class="px-3 py-1.5 text-xs rounded-lg border border-surface-200 dark:border-surface-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
            {{ $t('common.next') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import api from '@/services/api'

interface Movement {
  _id: string
  product: {
    _id: string
    name: string
    sku?: string
    images?: { public_id: string; secure_url: string }[]
    price?: number
    stock?: number
  }
  warehouse: { _id: string; name: string }
  type: string
  quantity: number
  referenceNumber: string
  reason: string
  user: { _id: string; name: string; email: string }
  oldStock: number
  newStock: number
  createdAt: string
}

interface Warehouse {
  _id: string
  name: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const movements = ref<Movement[]>([])
const warehouses = ref<Warehouse[]>([])
const pagination = ref<Pagination>({ page: 1, limit: 50, total: 0, pages: 1 })
const loading = ref(true)
const error = ref<string | null>(null)

const filters = ref({
  type: 'all',
  productSearch: '',
  warehouseId: 'all',
  startDate: '',
  endDate: '',
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const visiblePages = computed(() => {
  const p = pagination.value
  if (p.pages <= 1) return [1]
  const range: number[] = []
  const delta = 2
  const left = Math.max(2, p.page - delta)
  const right = Math.min(p.pages - 1, p.page + delta)
  range.push(1)
  for (let i = left; i <= right; i++) range.push(i)
  if (left > 2) range.push(-1)
  if (right < p.pages - 1) range.push(-1)
  range.push(p.pages)
  return range
})

onMounted(async () => {
  await fetchWarehouses()
  await fetchMovements()
})

function onFilterChange() {
  pagination.value.page = 1
  fetchMovements()
}

// Debounced product search
watch(() => filters.value.productSearch, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    pagination.value.page = 1
    fetchMovements()
  }, 400)
})

async function fetchWarehouses() {
  try {
    const data: any = await api.get('/inventory/warehouses')
    warehouses.value = data.warehouses || []
  } catch {
    warehouses.value = []
  }
}

async function fetchMovements() {
  loading.value = movements.value.length === 0
  error.value = null
  try {
    const params: Record<string, any> = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }
    if (filters.value.type !== 'all') params.type = filters.value.type
    if (filters.value.warehouseId !== 'all') params.warehouseId = filters.value.warehouseId
    if (filters.value.startDate) params.startDate = filters.value.startDate
    if (filters.value.endDate) params.endDate = filters.value.endDate
    if (filters.value.productSearch.trim()) params.search = filters.value.productSearch.trim()

    const data: any = await api.get('/inventory/movements', { params })
    movements.value = data.movements || []
    pagination.value = data.pagination || pagination.value
  } catch (err: any) {
    error.value = err.message || 'Failed to load stock movements'
  } finally {
    loading.value = false
  }
}

function goToPage(page: number) {
  if (page < 1 || page > pagination.value.pages) return
  pagination.value.page = page
  fetchMovements()
}

function resetFilters() {
  filters.value = {
    type: 'all',
    productSearch: '',
    warehouseId: 'all',
    startDate: '',
    endDate: '',
  }
  pagination.value.page = 1
  fetchMovements()
}

// ─── Type helpers ──────────────────────────────────────────────

function typeIcon(type: string): string {
  const icons: Record<string, string> = {
    stock_in: '📥',
    stock_out: '📤',
    adjustment: '⚙️',
    customer_order: '🛒',
    order_cancelled: '↩️',
    purchase_received: '📦',
    transfer: '🔄',
    return: '🔙',
    damaged: '⚠️',
    lost: '❌',
  }
  return icons[type] || '📋'
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    stock_in: 'Stock In',
    stock_out: 'Stock Out',
    adjustment: 'Adjustment',
    customer_order: 'Order',
    order_cancelled: 'Cancelled',
    purchase_received: 'Received',
    transfer: 'Transfer',
    return: 'Return',
    damaged: 'Damaged',
    lost: 'Lost',
  }
  return labels[type] || type
}

function typeBadgeClass(type: string): string {
  const map: Record<string, string> = {
    stock_in: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    stock_out: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    adjustment: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    customer_order: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    order_cancelled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    purchase_received: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    transfer: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    return: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    damaged: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return map[type] || 'bg-surface-100 text-surface-500'
}

function quantityClass(type: string): string {
  const positiveTypes = ['stock_in', 'purchase_received', 'return', 'order_cancelled']
  return positiveTypes.includes(type)
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400'
}

function stockChangeClass(oldVal: number, newVal: number): string {
  if (newVal > oldVal) return 'text-emerald-600 dark:text-emerald-400'
  if (newVal < oldVal) return 'text-red-600 dark:text-red-400'
  return 'text-surface-500'
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
