<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-16">
    <div class="text-center max-w-md animate-fade-in">
      <!-- Decorative Element -->
      <div class="relative mb-8">
        <div class="text-9xl font-bold text-[#F8D7E3] select-none">404</div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-24 h-24 bg-[#FFF4F7] rounded-full flex items-center justify-center mt-4">
            <span class="text-4xl">✨</span>
          </div>
        </div>
      </div>

      <h1 class="font-display text-2xl font-bold text-[#1A1A1A] mb-2">{{ $t('notFound.title') }}</h1>
      <p class="text-sm text-[#666666] mb-8 leading-relaxed">{{ $t('notFound.description') }}</p>

      <div class="flex items-center justify-center gap-3">
        <router-link to="/" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] text-white font-semibold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-button">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          {{ $t('common.goHome') }}
        </router-link>
        <button @click="router.back()" class="inline-flex items-center gap-2 px-6 py-3 border border-[#F1E6EA] text-[#666666] font-medium text-sm rounded-xl hover:bg-[#FFF8FA] active:scale-[0.98] transition-all">
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
</style>
