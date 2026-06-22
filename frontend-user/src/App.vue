<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const route = useRoute()

const layoutMap: Record<string, any> = {
  default: DefaultLayout,
  auth: AuthLayout,
}

const layout = computed(() => {
  const layoutName = (route.meta.layout as string) || 'default'
  return layoutMap[layoutName] || DefaultLayout
})

onMounted(() => {
  // Initialize theme on load
  import('@/stores/theme').then(({ useThemeStore }) => {
    useThemeStore().init()
  })
})
</script>
