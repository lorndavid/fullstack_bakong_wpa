<template>
  <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
    <div v-for="i in 8" :key="i" class="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-surface-800 rounded-xl shadow-card animate-pulse">
      <div class="w-12 h-12 sm:w-14 sm:h-14 bg-surface-200 dark:bg-surface-700 rounded-full shimmer"></div>
      <div class="h-3 w-16 bg-surface-200 dark:bg-surface-700 rounded shimmer"></div>
    </div>
  </div>
</template>

<style scoped>
.shimmer {
  position: relative;
  overflow: hidden;
}
.shimmer::after {
  content: '';
  @apply absolute inset-0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transform: translateX(-100%);
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
</style>
