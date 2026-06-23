<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, provide } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import api from '@/services/api'
import { mergeTextOverrides } from '@/i18n'

const route = useRoute()
const siteLogo = ref('')

// Provide logo URL for layouts to consume
provide('siteLogo', siteLogo)

const layoutMap: Record<string, any> = {
  default: DefaultLayout,
  auth: AuthLayout,
}

const layout = computed(() => {
  const layoutName = (route.meta.layout as string) || 'default'
  return layoutMap[layoutName] || DefaultLayout
})

async function loadSettings() {
  try {
    const data: any = await api.get('/settings')
    const s = data.settings
    if (!s) return

    // Apply custom colors as CSS custom properties
    if (s.colors) {
      const root = document.documentElement
      if (s.colors.primary) {
        root.style.setProperty('--color-primary', s.colors.primary)
        root.style.setProperty('--color-primary-500', s.colors.primary)
      }
      if (s.colors.accent) {
        root.style.setProperty('--color-accent', s.colors.accent)
        root.style.setProperty('--color-accent-500', s.colors.accent)
      }
    }

    // Store custom logo URL
    if (s.logo?.secure_url) {
      siteLogo.value = s.logo.secure_url
    }

    // Merge custom text overrides into i18n
    if (s.textOverrides && Object.keys(s.textOverrides).length > 0) {
      mergeTextOverrides(s.textOverrides)
    }
  } catch {
    // Settings are optional - silently ignore
  }
}

onMounted(() => {
  // Initialize theme on load
  import('@/stores/theme').then(({ useThemeStore }) => {
    useThemeStore().init()
  })

  // Load custom settings from admin
  loadSettings()
})
</script>
