<template>
  <div class="space-y-6 sm:space-y-8 pb-6">
    <!-- Banner -->
    <BannerSkeleton />

    <!-- Categories -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between mb-4">
        <div class="h-6 w-32 skeleton rounded"></div>
        <div class="h-4 w-16 skeleton rounded"></div>
      </div>
      <CategorySkeleton />
    </section>

    <!-- Flash Sale -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between mb-4">
        <div class="h-6 w-40 skeleton rounded"></div>
        <div class="h-4 w-16 skeleton rounded"></div>
      </div>
      <div class="product-grid">
        <ProductCardSkeleton v-for="i in 5" :key="i" />
      </div>
    </section>

    <!-- Promotions -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="h-6 w-32 skeleton rounded mb-4"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-surface-800 rounded-2xl overflow-hidden shadow-card">
          <div class="aspect-video skeleton"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 skeleton rounded w-3/4"></div>
            <div class="h-3 skeleton rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Free Shipping Banner -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="h-32 bg-surface-200 dark:bg-surface-700 rounded-2xl skeleton"></div>
    </section>

    <!-- New Arrivals -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between mb-4">
        <div class="h-6 w-40 skeleton rounded"></div>
        <div class="h-4 w-16 skeleton rounded"></div>
      </div>
      <div class="product-grid">
        <ProductCardSkeleton v-for="i in 5" :key="i" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import BannerSkeleton from './BannerSkeleton.vue'
import CategorySkeleton from './CategorySkeleton.vue'
import ProductCardSkeleton from './ProductCardSkeleton.vue'
</script>

<style scoped>
.skeleton {
  @apply bg-surface-200 dark:bg-surface-700 animate-pulse;
}
.product-grid {
  @apply grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4;
}
</style>
