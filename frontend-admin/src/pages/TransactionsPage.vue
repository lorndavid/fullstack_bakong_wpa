<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('transactions.title') }}</h2>
      </div>
      <div class="flex items-center gap-3">
        <button v-if="selectedIds.size > 0" @click="confirmBulkDelete"
          class="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all flex items-center gap-2 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Delete Selected ({{ selectedIds.size }})
        </button>
        <!-- Live indicator -->
        <div v-if="isLive" class="flex items-center gap-1.5 text-xs text-accent-500 font-medium">
          <span class="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></span>
          {{ $t('transactions.live') }}
        </div>
        <!-- Search -->
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('transactions.searchPlaceholder')"
            class="w-full sm:w-64 pl-10 pr-4 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>
        <!-- Status filter -->
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          <option value="all">{{ $t('transactions.allStatus') }}</option>
          <option value="PAID">{{ $t('transactions.paid') }}</option>
          <option value="PENDING">{{ $t('transactions.pending') }}</option>
          <option value="EXPIRED">{{ $t('transactions.expired') }}</option>
          <option value="failed">{{ $t('transactions.failed') }}</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && transactions.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-3 text-sm text-surface-500">{{ $t('common.loadingTransactions') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <p class="text-red-500 text-sm mb-3">{{ error }}</p>
      <button @click="fetchTransactions" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="transactions.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/>
      </svg>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">{{ $t('transactions.noTransactions') }}</h3>
      <p class="text-sm text-surface-500">{{ $t('transactions.noTransactionsDesc') }}</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="w-10 px-4 py-3">
                <input type="checkbox" @change="toggleSelectAll" :checked="selectedIds.size === transactions.length && transactions.length > 0"
                  class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500 cursor-pointer" />
              </th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('transactions.hash') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('transactions.order') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('transactions.amount') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('transactions.md5') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('transactions.status') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('transactions.date') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
            <tr v-for="tx in transactions" :key="tx._id"
              class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
              :class="{ 'animate-highlight': highlightedIds.has(tx._id) }">
              <td class="px-4 py-3" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(tx._id)" @change="toggleSelect(tx._id)"
                  class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500 cursor-pointer" />
              </td>
              <td class="px-4 py-3 font-mono text-xs text-surface-500">{{ tx._id?.slice(-8) }}</td>
              <td class="px-4 py-3">
                <router-link :to="`/orders`" class="font-mono text-sm text-primary-500 hover:text-primary-600 font-medium">
                  #{{ tx.orderId?.slice(-8).toUpperCase() }}
                </router-link>
              </td>
              <td class="px-4 py-3 text-sm font-semibold text-surface-800 dark:text-white">
                ${{ (tx.amount || 0).toFixed(2) }}
              </td>
              <td class="px-4 py-3">
                <span class="font-mono text-[10px] text-surface-400 bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded" :title="tx.md5">
                  {{ tx.md5?.slice(0, 12) }}...
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="statusBadgeClass(tx.status)">
                  <span v-if="tx.status === 'PAID'" class="w-1.5 h-1.5 bg-accent-500 rounded-full"></span>
                  <span v-else-if="tx.status === 'PENDING'" class="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                  <span v-else class="w-1.5 h-1.5 bg-surface-400 rounded-full"></span>
                  {{ tx.status === 'PAID' ? $t('transactions.paid') : tx.status === 'PENDING' ? $t('transactions.pending') : tx.status === 'EXPIRED' ? $t('transactions.expired') : $t('transactions.failed') }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-surface-500 whitespace-nowrap">
                {{ formatDate(tx.createdAt) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <button @click="copyMd5(tx.md5)"
                    class="p-1.5 text-surface-400 hover:text-primary-500 transition-colors rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"
                    :title="$t('transactions.md5')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>
                  <button @click="confirmDeleteTransaction(tx)"
                    class="p-1.5 text-surface-400 hover:text-red-500 transition-colors rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"
                    :title="$t('common.delete')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
        <p class="text-xs text-surface-500">
          {{ $t('transactions.showingRange', { from: (pagination.page - 1) * pagination.limit + 1, to: Math.min(pagination.page * pagination.limit, pagination.total), total: pagination.total }) }}
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

    <!-- Bulk Delete Confirmation -->
    <div v-if="showBulkConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showBulkConfirm = false"></div>
      <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in text-center">
        <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        </div>
        <h3 class="text-lg font-bold text-surface-800 dark:text-white mb-2">Delete {{ selectedIds.size }} Transactions</h3>
        <p class="text-sm text-surface-500 mb-6">Are you sure you want to delete {{ selectedIds.size }} transaction(s)? This cannot be undone.</p>
        <div class="flex gap-3">
          <button @click="showBulkConfirm = false" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-surface-50">{{ $t('common.cancel') }}</button>
          <button @click="bulkDeleteTransactions" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">{{ deleting ? $t('common.deleting') : $t('common.delete') }}</button>
        </div>
      </div>
    </div>

    <!-- Single Delete Confirmation -->
    <div v-if="deletingTx" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="deletingTx = null"></div>
      <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in text-center">
        <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        </div>
        <h3 class="text-lg font-bold text-surface-800 dark:text-white mb-2">{{ $t('transactions.deleteTitle') }}</h3>
        <p class="text-sm text-surface-500 mb-6" v-html="$t('transactions.deleteDesc', { id: deletingTx._id?.slice(-8) })"></p>
        <div class="flex gap-3">
          <button @click="deletingTx = null" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-surface-50">{{ $t('common.cancel') }}</button>
          <button @click="deleteTransaction" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">{{ deleting ? $t('common.deleting') : $t('common.delete') }}</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toastMessage" class="fixed bottom-6 right-6 z-50 bg-surface-800 dark:bg-surface-700 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm animate-slide-up">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import api from '@/services/api'

interface Transaction {
  _id: string
  orderId: string
  amount: number
  tran?: string
  md5?: string
  qr?: string
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'failed'
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const transactions = ref<Transaction[]>([])
const pagination = ref<Pagination>({ page: 1, limit: 20, total: 0, pages: 1 })
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const statusFilter = ref('all')
const highlightedIds = ref(new Set<string>())
const toastMessage = ref<string | null>(null)
const isLive = ref(false)
// Bulk selection
const selectedIds = ref<Set<string>>(new Set())
const showBulkConfirm = ref(false)

const deletingTx = ref<Transaction | null>(null)
const deleting = ref(false)

let eventSource: EventSource | null = null
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let toastTimeout: ReturnType<typeof setTimeout> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

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

onMounted(() => {
  fetchTransactions()
  startSSE()
})

onUnmounted(() => {
  stopSSE()
  if (searchTimeout) clearTimeout(searchTimeout)
  if (toastTimeout) clearTimeout(toastTimeout)
  if (reconnectTimer) clearTimeout(reconnectTimer)
})

// Debounced search
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    fetchTransactions()
  }, 400)
})

watch(statusFilter, () => {
  pagination.value.page = 1
  fetchTransactions()
})

async function fetchTransactions() {
  loading.value = transactions.value.length === 0
  error.value = null
  try {
    const params: Record<string, any> = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }
    if (searchQuery.value) params.search = searchQuery.value
    if (statusFilter.value !== 'all') params.status = statusFilter.value

    const data: any = await api.get('/payment/transactions', { params })
    transactions.value = data.transactions || []
    pagination.value = data.pagination || pagination.value
  } catch (err: any) {
    error.value = err.message || 'Failed to load transactions'
  } finally {
    loading.value = false
  }
}

function goToPage(page: number) {
  if (page < 1 || page > pagination.value.pages) return
  pagination.value.page = page
  fetchTransactions()
}

/**
 * Start SSE stream for global payment events (admin dashboard).
 */
function startSSE() {
  stopSSE()
  const token = localStorage.getItem('admin_token')
  const sseUrl = token ? `/api/payment/stream?token=${token}` : '/api/payment/stream'

  try {
    eventSource = new EventSource(sseUrl)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'payment') {
          if (data.status === 'PAID' || data.status === 'EXPIRED') {
            // Add this transaction ID to highlighted set temporarily
            if (data.transactionId) {
              highlightedIds.value = new Set([...highlightedIds.value, data.transactionId])
              setTimeout(() => {
                const newSet = new Set(highlightedIds.value)
                newSet.delete(data.transactionId)
                highlightedIds.value = newSet
              }, 3000)
            }

            // Show toast notification
            showToast(
              data.status === 'PAID'
                ? `✅ Payment confirmed — $${(data.amount || 0).toFixed(2)}`
                : `⏰ Payment expired (${data.orderId?.slice(-8).toUpperCase() || 'N/A'})`
            )

            // Refresh the list if we're on page 1 with no filters
            if (pagination.value.page === 1 && !searchQuery.value && statusFilter.value === 'all') {
              fetchTransactions()
            }
          }
        } else if (data.type === 'connected') {
          isLive.value = true
        }
      } catch {}
    }

    eventSource.onerror = () => {
      isLive.value = false
      // Try to reconnect after 5s
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        stopSSE()
        startSSE()
      }, 5000)
    }
  } catch {
    // SSE not available — that's ok, we poll via fetch
  }
}

function stopSSE() {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  isLive.value = false
}

function showToast(msg: string) {
  toastMessage.value = msg
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => {
    toastMessage.value = null
  }, 4000)
}

function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    PAID: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    EXPIRED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return map[status] || 'bg-surface-100 text-surface-500'
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

async function copyMd5(md5?: string) {
  if (!md5) return
  try {
    await navigator.clipboard.writeText(md5)
    showToast('MD5 copied to clipboard')
  } catch {
    showToast('Failed to copy')
  }
}

function toggleSelect(id: string) {
  const newSet = new Set(selectedIds.value)
  if (newSet.has(id)) newSet.delete(id)
  else newSet.add(id)
  selectedIds.value = newSet
}

function toggleSelectAll() {
  if (selectedIds.value.size === transactions.value.length) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(transactions.value.map(t => t._id))
  }
}

function confirmBulkDelete() {
  showBulkConfirm.value = true
}

async function bulkDeleteTransactions() {
  deleting.value = true
  try {
    const ids = Array.from(selectedIds.value)
    await Promise.all(ids.map(id => api.delete(`/payment/transactions/${id}`)))
    showBulkConfirm.value = false
    selectedIds.value = new Set()
    showToast('Transactions deleted')
    await fetchTransactions()
  } catch (err: any) {
    showToast(err.message || 'Failed to delete')
  } finally {
    deleting.value = false
  }
}

function confirmDeleteTransaction(tx: Transaction) {
  deletingTx.value = tx
}

async function deleteTransaction() {
  if (!deletingTx.value) return
  deleting.value = true
  try {
    await api.delete(`/payment/transactions/${deletingTx.value._id}`)
    deletingTx.value = null
    showToast('Transaction deleted')
    fetchTransactions()
  } catch (err: any) {
    showToast(err.message || 'Failed to delete')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
@keyframes highlight-flash {
  0% { background-color: rgba(0, 200, 83, 0.15); }
  100% { background-color: transparent; }
}

.animate-highlight {
  animation: highlight-flash 2s ease-out;
}
</style>
