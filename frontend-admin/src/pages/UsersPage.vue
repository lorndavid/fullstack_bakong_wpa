<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('users.title') }}</h2>
      <span class="text-sm text-surface-500" v-if="!loading">{{ totalUsers }} users</span>
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
              @click="router.push(`/users/${u._id}`)"
              class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer"
            >
              <td class="px-4 py-3">
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
                <button
                  @click.stop="router.push(`/users/${u._id}`)"
                  class="p-1.5 text-primary-500 hover:text-primary-600 transition-colors"
                  title="View details"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
