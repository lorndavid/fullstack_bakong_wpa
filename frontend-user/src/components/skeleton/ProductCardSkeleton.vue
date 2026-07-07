<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700/60 overflow-hidden shadow-card">
    <div class="aspect-square skeleton shimmer"></div>
    <div class="p-3 space-y-2">
      <div class="flex gap-1 mb-1">
        <div v-for="i in 5" :key="i" class="w-3 h-3 rounded skeleton"></div>
      </div>
      <div class="h-4 skeleton rounded w-3/4"></div>
      <div class="h-4 skeleton rounded w-1/2"></div>
      <div class="flex items-center justify-between pt-1">
        <div class="h-5 skeleton rounded w-16"></div>
        <div class="w-8 h-8 rounded-lg skeleton"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  @apply bg-surface-200 dark:bg-surface-700;
}
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
