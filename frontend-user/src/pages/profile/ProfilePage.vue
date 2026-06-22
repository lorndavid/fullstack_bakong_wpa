<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <h1 class="text-xl sm:text-2xl font-bold text-surface-800 dark:text-white mb-6">My Profile</h1>

    <!-- Profile Card -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-6">
      <!-- Avatar -->
      <div class="flex items-center gap-4">
        <div class="w-20 h-20 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-3xl font-bold text-primary-600 dark:text-primary-300">{{ auth.user?.name?.charAt(0).toUpperCase() }}</span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ auth.user?.name }}</h2>
          <p class="text-sm text-surface-500">{{ auth.user?.email }}</p>
          <span class="inline-block mt-1 px-2.5 py-0.5 bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 text-xs font-medium rounded-full">
            {{ auth.user?.role }}
          </span>
        </div>
      </div>

      <!-- Info -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Full Name</label>
          <input v-model="name" class="w-full px-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Email</label>
          <input :value="auth.user?.email" disabled class="w-full px-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 text-surface-400 rounded-lg text-sm cursor-not-allowed" />
        </div>
        <button class="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all focus:ring-4 focus:ring-primary-500/30">
          Save Changes
        </button>
      </div>

      <hr class="border-surface-200 dark:border-surface-700" />

      <div class="space-y-3">
        <button @click="handleLogout" class="w-full py-2.5 border-2 border-red-200 dark:border-red-800 text-red-500 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const name = ref(auth.user?.name || '')

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>
