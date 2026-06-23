<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-surface-800 dark:text-white">{{ $t('auth.registerTitle') }}</h1>
      <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">{{ $t('auth.registerSubtitle') }}</p>
    </div>

    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
      {{ error }}
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('auth.name') }}</label>
        <input
          v-model="name"
          type="text"
          required
          :placeholder="$t('checkout.fullNamePlaceholder')"
          class="w-full px-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('auth.email') }}</label>
        <input
          v-model="email"
          type="email"
          required
          placeholder="you@example.com"
          class="w-full px-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('auth.password') }}</label>
        <input
          v-model="password"
          type="password"
          required
          minlength="6"
          placeholder="••••••••"
          class="w-full px-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('auth.confirmPassword') }}</label>
        <input
          v-model="confirmPassword"
          type="password"
          required
          placeholder="••••••••"
          class="w-full px-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
        />
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 focus:ring-4 focus:ring-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
          {{ $t('auth.creatingAccount') }}
        </span>
        <span v-else>{{ $t('auth.registerTitle') }}</span>
      </button>
    </form>

    <p class="text-center text-sm text-surface-500 dark:text-surface-400">
      {{ $t('auth.hasAccount') }}
      <router-link to="/auth/login" class="text-primary-500 hover:text-primary-600 font-semibold">{{ $t('auth.signIn') }}</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    error.value = t('auth.passwordsDoNotMatch')
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.register(name.value, email.value, password.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
