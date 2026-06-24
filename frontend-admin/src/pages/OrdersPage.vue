<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
        </div>
        <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('orders.title') }}</h2>
      </div>
      <div class="flex items-center gap-2">
        <button v-if="selectedIds.size > 0" @click="confirmBulkDelete"
          class="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all flex items-center gap-2 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Delete Selected ({{ selectedIds.size }})
        </button>
        <select v-model="statusFilter" @change="fetchOrders" class="px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50">
          <option value="all">{{ $t('common.allStatus') }}</option>
          <option value="pending">{{ $t('orders.pending') }}</option>
          <option value="confirmed">{{ $t('orders.confirmed') }}</option>
          <option value="shipping">{{ $t('orders.shipping') }}</option>
          <option value="delivered">{{ $t('orders.delivered') }}</option>
          <option value="cancelled">{{ $t('orders.cancelled') }}</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-3 text-sm text-surface-500">{{ $t('common.loadingOrders') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <p class="text-red-500 text-sm mb-3">{{ error }}</p>
      <button @click="fetchOrders" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">{{ $t('orders.noOrders') }}</h3>
      <p class="text-sm text-surface-500">{{ $t('orders.noOrdersDesc') }}</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="w-10 px-4 py-3">
                <input type="checkbox" @change="toggleSelectAll" :checked="selectedIds.size === orders.length && orders.length > 0"
                  class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500 cursor-pointer" />
              </th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('orders.orderId') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('orders.customer') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('orders.items') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('orders.total') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('orders.promoDiscount') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('orders.payment') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('orders.status') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('orders.date') }}</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
            <tr v-for="order in orders" :key="order._id" class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
              <td class="px-4 py-3" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(order._id)" @change="toggleSelect(order._id)"
                  class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500 cursor-pointer" />
              </td>
              <td class="px-4 py-3 font-mono text-sm font-medium text-primary-500">#{{ order._id?.slice(-8).toUpperCase() }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center">
                    <span class="text-xs font-bold text-surface-500">{{ order.shippingAddress?.fullName?.charAt(0) || '?' }}</span>
                  </div>
                  <div>
                    <span class="text-sm text-surface-800 dark:text-white font-medium">{{ order.shippingAddress?.fullName || 'N/A' }}</span>
                    <p class="text-xs text-surface-400">{{ order.shippingAddress?.phone || '' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{{ order.products?.length || 0 }} {{ $t('orders.items') }}</td>
              <td class="px-4 py-3 text-sm font-semibold text-surface-800 dark:text-white">${{ (order.total || 0).toFixed(2) }}</td>
              <td class="px-4 py-3 text-sm">
                <span v-if="order.promotionDiscount > 0" class="text-accent-500 font-medium">-${{ (order.promotionDiscount || 0).toFixed(2) }}</span>
                <span v-else class="text-surface-400 text-xs">—</span>
              </td>
              <td class="px-4 py-3 text-sm">
                <span class="px-2 py-0.5 rounded text-xs font-medium" :class="order.paymentMethod === 'khqr' ? 'bg-primary-100 text-primary-700' : 'bg-surface-100 text-surface-600'">
                  {{ order.paymentMethod === 'khqr' ? 'KHQR' : 'COD' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <select @change="updateStatus(order._id, $event)" class="px-2 py-1 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  :class="statusBadgeClass(order.status)">
                  <option value="pending" :selected="order.status === 'pending'">{{ $t('orders.pending') }}</option>
                  <option value="confirmed" :selected="order.status === 'confirmed'">{{ $t('orders.confirmed') }}</option>
                  <option value="shipping" :selected="order.status === 'shipping'">{{ $t('orders.shipping') }}</option>
                  <option value="delivered" :selected="order.status === 'delivered'">{{ $t('orders.delivered') }}</option>
                  <option value="cancelled" :selected="order.status === 'cancelled'">{{ $t('orders.cancelled') }}</option>
                </select>
              </td>
              <td class="px-4 py-3 text-sm text-surface-500 whitespace-nowrap">{{ formatDate(order.createdAt) }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <router-link :to="`/orders`" class="p-1.5 text-surface-400 hover:text-primary-500 transition-colors" :title="$t('common.edit')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </router-link>
                  <button @click="confirmDeleteOrder(order)" class="p-1.5 text-surface-400 hover:text-red-500 transition-colors" :title="$t('common.delete')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700">
        <p class="text-sm text-surface-500">{{ $t('orders.showingOf', { count: orders.length, total: pagination.total }) }}</p>
        <div class="flex items-center gap-2">
          <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1" class="px-3 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-50 dark:hover:bg-surface-700">{{ $t('common.previous') }}</button>
          <span class="text-sm text-surface-500">{{ $t('orders.pageOf', { page: pagination.page, pages: pagination.pages }) }}</span>
          <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page >= pagination.pages" class="px-3 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-50 dark:hover:bg-surface-700">{{ $t('common.next') }}</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <!-- Bulk Delete Confirmation -->
    <div v-if="showBulkConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showBulkConfirm = false"></div>
      <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in text-center">
        <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        </div>
        <h3 class="text-lg font-bold text-surface-800 dark:text-white mb-2">Delete {{ selectedIds.size }} Orders</h3>
        <p class="text-sm text-surface-500 mb-6">Are you sure you want to delete {{ selectedIds.size }} order(s)? Product stock will be restored.</p>
        <div class="flex gap-3">
          <button @click="showBulkConfirm = false" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-surface-50">{{ $t('common.cancel') }}</button>
          <button @click="bulkDeleteOrders" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">{{ deleting ? $t('common.deleting') : $t('common.delete') }}</button>
        </div>
      </div>
    </div>

    <!-- Single Delete Confirmation -->
    <div v-if="deletingOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="deletingOrder = null"></div>
      <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in text-center">
        <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        </div>
        <h3 class="text-lg font-bold text-surface-800 dark:text-white mb-2">{{ $t('orders.deleteTitle') }}</h3>
        <p class="text-sm text-surface-500 mb-6">{{ $t('orders.deleteDesc', { id: deletingOrder._id?.slice(-8).toUpperCase() }) }}</p>
        <div class="flex gap-3">
          <button @click="deletingOrder = null" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-surface-50">{{ $t('common.cancel') }}</button>
          <button @click="deleteOrder" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">{{ deleting ? $t('common.deleting') : $t('common.delete') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import api from '@/services/api'

interface Order {
  _id: string
  userId: { _id: string; name: string; email: string }
  products: { productId: string; name: string; image: string; price: number; quantity: number }[]
  subtotal: number
  shipping: number
  promotionDiscount: number
  total: number
  status: string
  shippingAddress: { fullName: string; phone: string }
  paymentMethod: string
  createdAt: string
}

const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const statusFilter = ref('all')
const pagination = ref({ page: 1, limit: 20, total: 0, pages: 0 })
const deletingOrder = ref<Order | null>(null)
const deleting = ref(false)

// Bulk selection
const selectedIds = ref<Set<string>>(new Set())
const showBulkConfirm = ref(false)

onMounted(() => fetchOrders())

watch(statusFilter, () => { pagination.value.page = 1; fetchOrders() })

async function fetchOrders() {
  loading.value = true
  error.value = null
  try {
    const params: Record<string, any> = { page: pagination.value.page, limit: pagination.value.limit }
    if (statusFilter.value !== 'all') params.status = statusFilter.value
    const data: any = await api.get('/orders/admin/all', { params })
    orders.value = data.orders || []
    pagination.value = data.pagination || pagination.value
  } catch (err: any) {
    error.value = err.message || 'Failed to load orders'
  } finally {
    loading.value = false
  }
}

function toggleSelect(id: string) {
  const newSet = new Set(selectedIds.value)
  if (newSet.has(id)) newSet.delete(id)
  else newSet.add(id)
  selectedIds.value = newSet
}

function toggleSelectAll() {
  if (selectedIds.value.size === orders.value.length) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(orders.value.map(o => o._id))
  }
}

function confirmBulkDelete() {
  showBulkConfirm.value = true
}

async function bulkDeleteOrders() {
  deleting.value = true
  try {
    const ids = Array.from(selectedIds.value)
    await api.post('/orders/admin/bulk-delete', { ids })
    showBulkConfirm.value = false
    selectedIds.value = new Set()
    await fetchOrders()
  } catch (err: any) {
    alert(err.message || 'Failed to delete orders')
  } finally {
    deleting.value = false
  }
}

function goToPage(page: number) {
  if (page < 1 || page > pagination.value.pages) return
  pagination.value.page = page
  fetchOrders()
}

async function updateStatus(id: string, event: Event) {
  const status = (event.target as HTMLSelectElement).value
  try {
    await api.put(`/orders/admin/${id}/status`, { status })
  } catch (err: any) {
    alert(err.message || 'Failed to update status')
  }
}

function confirmDeleteOrder(order: Order) {
  deletingOrder.value = order
}

async function deleteOrder() {
  if (!deletingOrder.value) return
  deleting.value = true
  try {
    await api.delete(`/orders/admin/${deletingOrder.value._id}`)
    deletingOrder.value = null
    fetchOrders()
  } catch (err: any) {
    alert(err.message || 'Failed to delete order')
  } finally {
    deleting.value = false
  }
}

function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
    shipping: 'bg-purple-100 text-purple-700 border-purple-300',
    delivered: 'bg-accent-100 text-accent-700 border-accent-300',
    cancelled: 'bg-red-100 text-red-700 border-red-300',
  }
  return map[status] || 'bg-surface-100 text-surface-500'
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
