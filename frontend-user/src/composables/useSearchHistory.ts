import { ref, computed } from 'vue'

const STORAGE_KEY = 'search_history'
const MAX_ITEMS = 20

export function useSearchHistory() {
  const searches = ref<string[]>(loadFromStorage())

  function loadFromStorage(): string[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches.value))
  }

  function addSearch(query: string) {
    const trimmed = query.trim()
    if (!trimmed) return

    // Remove duplicate if exists
    const index = searches.value.indexOf(trimmed)
    if (index >= 0) {
      searches.value.splice(index, 1)
    }

    // Add to front
    searches.value.unshift(trimmed)

    // Trim to max
    if (searches.value.length > MAX_ITEMS) {
      searches.value = searches.value.slice(0, MAX_ITEMS)
    }

    persist()
  }

  function removeSearch(query: string) {
    const index = searches.value.indexOf(query)
    if (index >= 0) {
      searches.value.splice(index, 1)
      persist()
    }
  }

  function clearAll() {
    searches.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  const recentSearches = computed(() => searches.value)

  // Popular searches - in a real app these would come from the API
  const popularSearches = ref<string[]>([
    'moisturizer',
    'sunscreen',
    'serum',
    'face wash',
    'lipstick',
    'body lotion',
  ])

  return {
    recentSearches,
    popularSearches,
    addSearch,
    removeSearch,
    clearAll,
  }
}
