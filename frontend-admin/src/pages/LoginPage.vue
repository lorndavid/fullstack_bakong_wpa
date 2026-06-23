<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 dark:from-surface-900 dark:via-surface-800 dark:to-primary-900 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="inline-flex items-center space-x-2 mb-4">
          <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-primary-500 font-bold text-xl">M</span>
          </div>
        </div>
        <h1 class="text-2xl font-bold text-white">{{ $t('auth.adminPanel') }}</h1>
        <p class="text-white/60 text-sm mt-1">{{ $t('auth.signInDesc') }}</p>
      </div>

      <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-xl p-6">
        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4">
          {{ error }}
        </div>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('auth.email') }}</label>
            <input v-model="email" type="email" required
              class="w-full px-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
              :placeholder="$t('auth.emailPlaceholder')" />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('auth.password') }}</label>
            <input v-model="password" type="password" required
              class="w-full px-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
              :placeholder="$t('auth.passwordPlaceholder')" />
          </div>
          <button type="submit" :disabled="loading"
            class="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50">
            <span v-if="loading">{{ $t('auth.signingIn') }}</span>
            <span v-else>{{ $t('auth.signIn') }}</span>
          </button>
        </form>
      </div>
    </div>
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

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.message || t('auth.invalidCredentials')
  } finally {
    loading.value = false
  }
}
</script>
