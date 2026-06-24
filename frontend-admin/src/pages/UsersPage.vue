<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('users.title') }}</h2>
        <span class="text-sm text-surface-500" v-if="!loading">({{ totalUsers }})</span>
      </div>
      <div class="flex items-center gap-2">
        <button v-if="selectedIds.size > 0" @click="confirmBulkDelete"
          class="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Delete Selected ({{ selectedIds.size }})
        </button>
        <button @click="openCreateAdmin"
          class="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-all flex items-center gap-2 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          + New Admin
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl p-12 shadow-card text-center">
      <div class="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
      <p class="text-sm text-surface-500 mt-3">{{ $t('common.loading') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-card text-center">
      <p class="text-red-500 text-sm">{{ error }}</p>
      <button @click="fetchUsers" class="mt-3 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors">
        {{ $t('common.retry') }}
      </button>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="w-10 px-4 py-3">
                <input type="checkbox" @change="toggleSelectAll" :checked="selectedIds.size === users.length && users.length > 0"
                  class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500 cursor-pointer" />
              </th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('users.user') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('users.email') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('users.role') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Provider</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('users.orders') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('users.joined') }}</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
            <tr
              v-for="u in users"
              :key="u._id"
              class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
            >
              <td class="px-4 py-3" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(u._id)" @change="toggleSelect(u._id)"
                  class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500 cursor-pointer" />
              </td>
              <td class="px-4 py-3 cursor-pointer" @click="router.push(`/users/${u._id}`)">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-primary-100 dark:bg-primary-900/50">
                    <img
                      v-if="u.avatar && !brokenAvatars[u._id]"
                      :src="u.avatar"
                      :alt="u.name"
                      class="w-full h-full object-cover"
                      @error="brokenAvatars[u._id] = true"
                    />
                    <div v-if="!u.avatar || brokenAvatars[u._id]" class="w-full h-full flex items-center justify-center">
                      <span class="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {{ u.name?.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <span class="text-sm font-medium text-surface-800 dark:text-white truncate max-w-[120px]">
                    {{ u.name }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{{ u.email }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="u.role === 'admin'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300'"
                >
                  {{ u.role === 'admin' ? $t('users.admin') : $t('users.customer') }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="text-xs text-surface-500 dark:text-surface-400">
                  {{ u.provider === 'google' ? 'Google' : 'Email' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{{ u.ordersCount || 0 }}</td>
              <td class="px-4 py-3 text-sm text-surface-500">{{ formatDate(u.createdAt) }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button @click.stop="router.push(`/users/${u._id}`)" class="p-1.5 text-primary-500 hover:text-primary-600 transition-colors" title="View details">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button @click.stop="confirmDeleteUser(u)" class="p-1.5 text-surface-400 hover:text-red-500 transition-colors" title="Delete">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="users.length === 0 && !loading" class="p-12 text-center">
        <div class="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
          </svg>
        </div>
        <p class="text-sm text-surface-500 mt-4">No users found</p>
        <p class="text-xs text-surface-400 mt-1">Users will appear once they sign in with Google.</p>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-3 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between">
        <p class="text-xs text-surface-500">
          {{ $t('common.page') }} {{ page }} {{ $t('common.of') }} {{ totalPages }}
        </p>
        <div class="flex gap-2">
          <button @click="changePage(-1)" :disabled="page <= 1"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-600 disabled:opacity-40 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
            {{ $t('common.previous') }}
          </button>
          <button @click="changePage(1)" :disabled="page >= totalPages"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-600 disabled:opacity-40 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
            {{ $t('common.next') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create Admin Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="showCreateModal = false"></div>
      <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
        <div class="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
          <h3 class="text-lg font-bold text-surface-800 dark:text-white">Create New Admin</h3>
          <button @click="showCreateModal = false" class="p-1 text-surface-400 hover:text-surface-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <form @submit.prevent="createAdminUser" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Name</label>
            <input v-model="createForm.name" required class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Email</label>
            <input v-model="createForm.email" type="email" required class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Password</label>
            <input v-model="createForm.password" type="password" required minlength="6" class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <div v-if="createError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">{{ createError }}</div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showCreateModal = false" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-surface-50">Cancel</button>
            <button type="submit" :disabled="creating" class="flex-1 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50">{{ creating ? 'Creating...' : 'Create Admin' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete User Confirmation -->
    <div v-if="deletingUser" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="deletingUser = null"></div>
      <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in text-center">
        <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        </div>
        <h3 class="text-lg font-bold text-surface-800 dark:text-white mb-2">Delete User</h3>
        <p class="text-sm text-surface-500 mb-6">Are you sure you want to delete <strong>{{ deletingUser.name }}</strong>? This will also delete their orders and cannot be undone.</p>
        <div class="flex gap-3">
          <button @click="deletingUser = null" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-surface-50">Cancel</button>
          <button @click="deleteSingleUser" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">{{ deleting ? 'Deleting...' : 'Delete' }}</button>
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation -->
    <div v-if="showBulkConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="showBulkConfirm = false"></div>
      <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in text-center">
        <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        </div>
        <h3 class="text-lg font-bold text-surface-800 dark:text-white mb-2">Delete {{ selectedIds.size }} Users</h3>
        <p class="text-sm text-surface-500 mb-6">Are you sure you want to delete {{ selectedIds.size }} user(s)? This action cannot be undone.</p>
        <div class="flex gap-3">
          <button @click="showBulkConfirm = false" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-surface-50">Cancel</button>
          <button @click="bulkDeleteUsers" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">{{ deleting ? 'Deleting...' : 'Delete All' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

interface AdminUser {
  _id: string
  name: string
  email: string
  avatar?: string
  role: string
  provider: string
  ordersCount?: number
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const router = useRouter()

const users = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref('')
const page = ref(1)
const totalPages = ref(1)
const totalUsers = ref(0)
const brokenAvatars = ref<Record<string, boolean>>({})

// Selection
const selectedIds = ref<Set<string>>(new Set())

// Create admin modal
const showCreateModal = ref(false)
const createForm = ref({ name: '', email: '', password: '' })
const creating = ref(false)
const createError = ref('')

// Delete confirmation
const deletingUser = ref<AdminUser | null>(null)
const deleting = ref(false)

// Bulk delete
const showBulkConfirm = ref(false)

onMounted(() => {
  fetchUsers()
})

async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    const data: any = await api.get(`/users?page=${page.value}&limit=20`)
    users.value = data.users || []
    const pagination: Pagination = data.pagination
    totalPages.value = pagination?.pages || 1
    totalUsers.value = pagination?.total || 0
  } catch (err: any) {
    error.value = err?.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

function changePage(delta: number) {
  const newPage = page.value + delta
  if (newPage < 1 || newPage > totalPages.value) return
  page.value = newPage
  fetchUsers()
}

function toggleSelect(id: string) {
  const newSet = new Set(selectedIds.value)
  if (newSet.has(id)) newSet.delete(id)
  else newSet.add(id)
  selectedIds.value = newSet
}

function toggleSelectAll() {
  if (selectedIds.value.size === users.value.length) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(users.value.map(u => u._id))
  }
}

function openCreateAdmin() {
  createForm.value = { name: '', email: '', password: '' }
  createError.value = ''
  showCreateModal.value = true
}

async function createAdminUser() {
  if (!createForm.value.name || !createForm.value.email || !createForm.value.password) {
    createError.value = 'All fields are required'
    return
  }
  creating.value = true
  createError.value = ''
  try {
    await api.post('/users/create-admin', createForm.value)
    showCreateModal.value = false
    fetchUsers()
  } catch (err: any) {
    createError.value = err.message || 'Failed to create admin'
  } finally {
    creating.value = false
  }
}

function confirmDeleteUser(u: AdminUser) {
  deletingUser.value = u
}

function confirmBulkDelete() {
  showBulkConfirm.value = true
}

async function deleteSingleUser() {
  if (!deletingUser.value) return
  deleting.value = true
  try {
    await api.delete(`/users/${deletingUser.value._id}`)
    deletingUser.value = null
    selectedIds.value = new Set()
    fetchUsers()
  } catch {
    // Handle error
  } finally {
    deleting.value = false
  }
}

async function bulkDeleteUsers() {
  deleting.value = true
  try {
    const ids = Array.from(selectedIds.value)
    await api.delete('/users/bulk/delete', { data: { ids } })
    showBulkConfirm.value = false
    selectedIds.value = new Set()
    fetchUsers()
  } catch {
    // Handle error
  } finally {
    deleting.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
