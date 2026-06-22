<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4">
    <div class="text-center space-y-4">
      <div class="text-8xl font-bold text-primary-500/20">404</div>
      <h1 class="text-2xl font-bold text-surface-800 dark:text-white">Page Not Found</h1>
      <p class="text-surface-500">The page you're looking for doesn't exist</p>
      <router-link to="/" class="inline-flex items-center px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
        Go Home
      </router-link>
    </div>
  </div>
</template>
