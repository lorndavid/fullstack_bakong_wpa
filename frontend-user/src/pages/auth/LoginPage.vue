<template>
  <div class="space-y-8">
    <!-- Header with Branding -->
    <div class="text-center space-y-4">
      <!-- Gradient Logo Circle -->
      <div class="mx-auto w-20 h-20 bg-gradient-to-br from-[#FF7AA2] to-[#C084FC] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF7AA2]/20 animate-bounce-in">
        <span class="text-2xl font-bold text-white font-display">G</span>
      </div>
      <div>
        <h1 class="font-display text-2xl font-bold text-[#1A1A1A]">
          {{ $t('auth.welcomeTitle') }}
        </h1>
        <p class="text-sm text-[#666666] mt-1.5">
          {{ $t('auth.welcomeSubtitle') }}
        </p>
      </div>
    </div>

    <!-- Google Login Button -->
    <div class="transition-all duration-300">
      <GoogleLoginButton :loading="loading" @click="handleGoogleLogin" />
    </div>

    <!-- Error Alert -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="error"
        class="flex items-start gap-3 bg-[#FFF4F7] border border-[#F8D7E3] text-[#FF7AA2] text-sm p-4 rounded-2xl"
      >
        <div class="w-6 h-6 bg-[#FF7AA2]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg class="w-3.5 h-3.5 text-[#FF7AA2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <span>{{ error }}</span>
      </div>
    </Transition>

    <!-- Divider -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-[#F1E6EA]"></div>
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="px-4 bg-white text-[#C4A8B6] tracking-wider font-medium">
          {{ $t('auth.secureLogin') }}
        </span>
      </div>
    </div>

    <!-- Trust badges -->
    <div class="grid grid-cols-2 gap-3">
      <div class="flex items-center gap-2.5 px-4 py-3 bg-[#FFF8FA] rounded-xl text-xs text-[#666666] border border-[#F1E6EA]">
        <div class="w-7 h-7 bg-[#E6FFE6] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-[#34C759]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <span>{{ $t('auth.encrypted') }}</span>
      </div>
      <div class="flex items-center gap-2.5 px-4 py-3 bg-[#FFF8FA] rounded-xl text-xs text-[#666666] border border-[#F1E6EA]">
        <div class="w-7 h-7 bg-[#E6FFE6] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-[#34C759]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span>{{ $t('auth.secure') }}</span>
      </div>
    </div>

    <!-- Footer -->
    <p class="text-center text-xs text-[#C4A8B6] leading-relaxed">
      {{ $t('auth.termsNotice') }}
      <br />
      <span class="text-[#C4A8B6]">{{ $t('auth.noPasswordNeeded') }}</span>
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
    const credential = await requestGoogleCredential(clientId)
    await auth.googleLogin(credential)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (err: any) {
    error.value = err?.message || t('auth.googleLoginFailed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
}
</style>
