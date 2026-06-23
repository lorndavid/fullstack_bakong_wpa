<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-surface-800 dark:text-white">{{ $t('auth.loginTitle') }}</h1>
      <p class="text-sm text-surface-500 dark:text-surface-400 mt-1">{{ $t('auth.loginSubtitle') }}</p>
    </div>

    <!-- Google Sign In -->
    <button 
      @click="handleGoogleLogin"
      :disabled="loading"
      class="w-full flex items-center justify-center gap-3 px-4 py-2.5 border-2 border-surface-200 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-all text-surface-700 dark:text-surface-200 font-medium disabled:opacity-50"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      {{ $t('auth.continueWithGoogle') }}
    </button>

    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-surface-200 dark:border-surface-700"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-3 bg-white dark:bg-surface-800 text-surface-400">{{ $t('auth.or') }}</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
      {{ error }}
    </div>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" class="space-y-4">
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
          placeholder="••••••••"
          class="w-full px-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
        />
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input id="remember" type="checkbox" class="w-4 h-4 text-primary-500 border-surface-300 rounded focus:ring-primary-500" />
          <label for="remember" class="ml-2 text-sm text-surface-600 dark:text-surface-400">{{ $t('auth.rememberMe') }}</label>
        </div>
        <a href="#" class="text-sm text-primary-500 hover:text-primary-600 font-medium">{{ $t('auth.forgotPassword') }}</a>
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 focus:ring-4 focus:ring-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
          {{ $t('auth.signingIn') }}
        </span>
        <span v-else>{{ $t('auth.signIn') }}</span>
      </button>
    </form>

    <p class="text-center text-sm text-surface-500 dark:text-surface-400">
      {{ $t('auth.noAccount') }}
      <router-link to="/auth/register" class="text-primary-500 hover:text-primary-600 font-semibold">{{ $t('auth.signUp') }}</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
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
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err: any) {
    error.value = err.message || t('auth.invalidCredentials')
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  loading.value = true
  error.value = ''
  try {
    const mockGoogleUser = {
      email: 'user_' + Date.now() + '@gmail.com',
      name: 'Google User',
      googleId: 'google_' + Date.now(),
      avatar: '',
    }
    await auth.googleLogin(mockGoogleUser)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err: any) {
    error.value = err.message || t('auth.googleLoginFailed')
  } finally {
    loading.value = false
  }
}
</script>
