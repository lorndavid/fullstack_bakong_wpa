<template>
  <div class="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-pulse">
    <div class="h-8 w-48 skeleton rounded mb-6"></div>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="md:col-span-2 space-y-4">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 space-y-4 shadow-card">
          <div class="h-5 w-32 skeleton rounded"></div>
          <div class="h-12 skeleton rounded w-full"></div>
          <div class="h-12 skeleton rounded w-full"></div>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 space-y-4 shadow-card">
          <div class="h-5 w-24 skeleton rounded"></div>
          <div v-for="i in 3" :key="i" class="flex items-center gap-4">
            <div class="w-20 h-20 skeleton rounded-xl"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 skeleton rounded w-3/4"></div>
              <div class="h-3 skeleton rounded w-1/4"></div>
            </div>
            <div class="h-4 skeleton rounded w-16"></div>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 space-y-3 shadow-card">
          <div class="h-5 w-24 skeleton rounded"></div>
          <div class="flex justify-between"><div class="h-4 w-20 skeleton rounded"></div><div class="h-4 w-16 skeleton rounded"></div></div>
          <div class="flex justify-between"><div class="h-4 w-20 skeleton rounded"></div><div class="h-4 w-16 skeleton rounded"></div></div>
          <div class="border-t pt-3 flex justify-between"><div class="h-5 w-16 skeleton rounded"></div><div class="h-5 w-20 skeleton rounded"></div></div>
          <div class="h-12 skeleton rounded w-full"></div>
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
