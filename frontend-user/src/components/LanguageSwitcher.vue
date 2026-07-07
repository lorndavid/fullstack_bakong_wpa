<template>
  <button
    @click="toggleLocale"
    class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border"
    :class="currentLocale === 'km'
      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800'
      : 'bg-surface-50 dark:bg-surface-700 text-surface-600 dark:text-surface-300 border-surface-200 dark:border-surface-600 hover:border-primary-300'"
    :title="currentLocale === 'en' ? 'ភាសាខ្មែរ' : 'English'"
  >
    <span class="hidden sm:inline font-semibold">{{ currentLocale === 'en' ? 'ខ្មែរ' : 'EN' }}</span>
    <span class="sm:hidden font-semibold">{{ currentLocale === 'en' ? 'KH' : 'EN' }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const currentLocale = computed(() => locale.value)

function toggleLocale() {
  const newLocale = locale.value === 'en' ? 'km' : 'en'
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
  document.documentElement.lang = newLocale
}
</script>
