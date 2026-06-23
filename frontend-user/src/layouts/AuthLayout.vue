<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 dark:from-surface-900 dark:via-surface-800 dark:to-primary-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8 animate-fade-in">
        <router-link to="/" class="inline-flex items-center space-x-3">
          <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-primary-500 font-bold text-xl">M</span>
          </div>
          <span class="text-white font-bold text-2xl">MY SHOP</span>
        </router-link>
      </div>

      <!-- Auth Card -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-slide-up">
        <router-view />
      </div>

      <!-- Footer -->
      <p class="text-center mt-6 text-xs text-white/50">
        {{ $t('auth.secureLogin') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
