<template>
  <div class="max-w-4xl mx-auto px-4 py-6 space-y-4 animate-pulse">
    <div class="h-8 w-24 skeleton rounded mb-6"></div>
    <div v-for="i in 3" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card">
      <div class="flex items-center gap-4">
        <div class="w-20 h-20 skeleton rounded-xl"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 skeleton rounded w-3/4"></div>
          <div class="h-5 skeleton rounded w-20"></div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 skeleton rounded-lg"></div>
          <div class="w-8 h-8 skeleton rounded-lg"></div>
          <div class="w-8 h-8 skeleton rounded-lg"></div>
        </div>
      </div>
    </div>
    <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card space-y-3">
      <div class="flex justify-between"><div class="h-4 w-20 skeleton rounded"></div><div class="h-4 w-16 skeleton rounded"></div></div>
      <div class="flex justify-between"><div class="h-4 w-20 skeleton rounded"></div><div class="h-4 w-16 skeleton rounded"></div></div>
      <div class="border-t pt-3 flex justify-between"><div class="h-5 w-16 skeleton rounded"></div><div class="h-5 w-20 skeleton rounded"></div></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  @apply bg-surface-200 dark:bg-surface-700;
}
</style>
