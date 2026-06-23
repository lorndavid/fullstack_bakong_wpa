<template>
  <router-view />
</template>

<script setup lang="ts">
import { ref, provide, onMounted } from 'vue'
import api from '@/services/api'

const siteLogo = ref('')
provide('siteLogo', siteLogo)

onMounted(async () => {
  try {
    const data: any = await api.get('/settings')
    if (data.settings?.logo?.secure_url) {
      siteLogo.value = data.settings.logo.secure_url
    }
  } catch {
    // Settings are optional
  }
})
</script>
