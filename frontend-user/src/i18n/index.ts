import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import km from './locales/km.json'

// Get saved locale from localStorage, default to 'en'
const savedLocale = localStorage.getItem('locale') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    km,
  },
})

// Helper to merge custom text overrides from backend settings into i18n messages
export function mergeTextOverrides(overrides: Record<string, string>) {
  // Map override keys to i18n message paths and update them
  // E.g. "banner.freeShipping" -> { banner: { freeShipping: "..." } }
  const enMessages: Record<string, any> = {}
  const kmMessages: Record<string, any> = {}

  for (const [key, value] of Object.entries(overrides)) {
    const parts = key.split('.')
    const isKhmer = key.endsWith('_km')
    const actualKey = isKhmer ? key.slice(0, -3) : key
    const actualParts = actualKey.split('.')
    
    if (!value) continue

    const target = isKhmer ? kmMessages : enMessages
    let current = target
    for (let i = 0; i < actualParts.length - 1; i++) {
      if (!current[actualParts[i]]) current[actualParts[i]] = {}
      current = current[actualParts[i]]
    }
    current[actualParts[actualParts.length - 1]] = value
  }

  // Merge into existing messages
  if (Object.keys(enMessages).length > 0) {
    i18n.global.mergeLocaleMessage('en', enMessages)
  }
  if (Object.keys(kmMessages).length > 0) {
    i18n.global.mergeLocaleMessage('km', kmMessages)
  }
}

export default i18n
