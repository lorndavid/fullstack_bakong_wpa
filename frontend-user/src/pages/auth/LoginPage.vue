<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center space-y-3">
      <div
        class="mx-auto w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20"
      >
        <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('auth.welcomeTitle') }}
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
          {{ $t('auth.welcomeSubtitle') }}
        </p>
      </div>
    </div>

    <!-- Google Login Button -->
    <GoogleLoginButton :loading="loading" @click="handleGoogleLogin" />

    <!-- Error Alert -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="error"
        class="flex items-start gap-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm p-4 rounded-xl"
      >
        <svg class="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ error }}</span>
      </div>
    </Transition>

    <!-- Divider -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="px-4 bg-white dark:bg-surface-800 text-gray-400 dark:text-gray-500 tracking-wider font-medium">
          {{ $t('auth.secureLogin') }}
        </span>
      </div>
    </div>

    <!-- Trust badges -->
    <div class="grid grid-cols-2 gap-3">
      <div
        class="flex items-center gap-2.5 px-4 py-3 bg-gray-50 dark:bg-surface-700/50 rounded-xl text-xs text-gray-500 dark:text-gray-400"
      >
        <svg class="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <span>{{ $t('auth.encrypted') }}</span>
      </div>
      <div
        class="flex items-center gap-2.5 px-4 py-3 bg-gray-50 dark:bg-surface-700/50 rounded-xl text-xs text-gray-500 dark:text-gray-400"
      >
        <svg class="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>{{ $t('auth.secure') }}</span>
      </div>
    </div>

    <!-- Footer -->
    <p class="text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
      {{ $t('auth.termsNotice') }}
      <br />
      <span class="text-gray-400 dark:text-gray-500">{{ $t('auth.noPasswordNeeded') }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import GoogleLoginButton from '@/components/GoogleLoginButton.vue'
import { initGoogleAuth, requestGoogleCredential } from '@/services/googleAuth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const loading = ref(false)
const error = ref('')

onMounted(async () => {
  // Pre-load Google Identity Services
  await initGoogleAuth()
})

async function handleGoogleLogin() {
  loading.value = true
  error.value = ''

  try {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    if (!clientId) {
      throw new Error(t('auth.missingClientId'))
    }

    // Open real Google Gmail popup
    const credential = await requestGoogleCredential(clientId)

    // Send credential to backend
    await auth.googleLogin(credential)

    // Redirect to home
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err: any) {
    if (err?.message) {
      error.value = err.message
    } else {
      error.value = t('auth.googleLoginFailed')
    }
  } finally {
    loading.value = false
  }
}
</script>
