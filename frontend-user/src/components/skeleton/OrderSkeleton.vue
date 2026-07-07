<template>
  <div class="max-w-3xl mx-auto px-4 py-6 space-y-4 animate-pulse">
    <div class="h-8 w-32 skeleton rounded mb-6"></div>
    <div v-for="i in 4" :key="i" class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 skeleton rounded-lg"></div>
          <div class="space-y-1">
            <div class="h-4 w-24 skeleton rounded"></div>
            <div class="h-3 w-16 skeleton rounded"></div>
          </div>
        </div>
        <div class="text-right space-y-1">
          <div class="h-4 w-16 skeleton rounded"></div>
          <div class="h-3 w-14 skeleton rounded ml-auto"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  @apply bg-surface-200 dark:bg-surface-700;
}
</style>
