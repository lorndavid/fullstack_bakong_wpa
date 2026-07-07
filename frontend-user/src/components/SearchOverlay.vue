<template>
  <Teleport to="body">
    <Transition name="search-overlay">
      <div
        v-if="visible"
        class="fixed inset-0 z-[80] flex flex-col bg-white dark:bg-surface-900"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <!-- Header -->
        <div class="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-surface-200 dark:border-surface-700">
          <!-- Back button -->
          <button
            @click="close"
            class="p-2 -ml-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-200 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            :aria-label="$t('common.goBack')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Search Input -->
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="searchInputRef"
              v-model="query"
              @input="onInput"
              @keydown.escape="close"
              @keydown.enter="handleEnter"
              type="search"
              :placeholder="$t('nav.search')"
              class="w-full pl-10 pr-10 py-2.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-600 text-surface-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              autocomplete="off"
              enterkeyhint="search"
            />
            <!-- Voice search -->
            <button
              @click="toggleVoiceSearch"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-surface-400 hover:text-primary-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              :aria-label="$t('search.voiceSearch')"
              :class="{ 'text-primary-500': isListening }"
            >
              <svg v-if="!isListening" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <svg v-else class="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto">
          <div class="max-w-3xl mx-auto px-4 py-4 space-y-6">
            <!-- Suggestions (when no query) -->
            <div v-if="!query && !searching && products.length === 0" class="animate-fade-in">
              <!-- Recent Searches -->
              <div v-if="searchHistory.recentSearches.value.length > 0">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-sm font-semibold text-surface-600 dark:text-surface-300 flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ $t('search.recentSearches') }}
                  </h3>
                  <button
                    @click="searchHistory.clearAll()"
                    class="text-xs text-surface-400 hover:text-red-500 transition-colors"
                  >
                    {{ $t('common.clear') }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="s in searchHistory.recentSearches.value"
                    :key="s"
                    @click="selectSuggestion(s)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-600 rounded-full text-xs sm:text-sm text-surface-600 dark:text-surface-300 hover:border-primary-300 hover:text-primary-600 transition-all"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ s }}
                  </button>
                </div>
              </div>

              <!-- Popular Searches -->
              <div class="mt-6">
                <h3 class="text-sm font-semibold text-surface-600 dark:text-surface-300 flex items-center gap-1.5 mb-3">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {{ $t('search.popularSearches') }}
                </h3>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="s in searchHistory.popularSearches.value"
                    :key="s"
                    @click="selectSuggestion(s)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-full text-xs sm:text-sm text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all"
                  >
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
                    </svg>
                    {{ s }}
                  </button>
                </div>
              </div>

              <div v-if="searchHistory.recentSearches.value.length === 0">
                <p class="text-sm text-surface-400 text-center py-8">{{ $t('search.noSearches') }}</p>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="searching" class="flex items-center justify-center py-12">
              <div class="w-6 h-6 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="text-center py-8">
              <p class="text-sm text-red-500">{{ error }}</p>
            </div>

            <!-- Results Grid -->
            <div v-else-if="products.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div
                v-for="product in products"
                :key="product._id"
                @click="goToProduct(product._id)"
                class="group bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden cursor-pointer hover:-translate-y-1"
              >
                <div class="relative aspect-square overflow-hidden bg-surface-100 dark:bg-surface-700">
                  <img
                    v-if="product.images && product.images.length > 0"
                    :src="product.images[0].secure_url"
                    :alt="product.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="w-10 h-10 text-surface-300 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span v-if="product.discount > 0" class="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">-{{ product.discount }}%</span>
                </div>
                <div class="p-3 space-y-1">
                  <h3 class="text-sm font-semibold text-surface-800 dark:text-white truncate">{{ product.name }}</h3>
                  <div class="flex items-center gap-2">
                    <span v-if="product.discount > 0" class="text-base font-bold text-accent-500">
                      ${{ (product.price * (1 - product.discount / 100)).toFixed(2) }}
                    </span>
                    <span v-if="product.discount > 0" class="text-xs text-surface-400 line-through">${{ product.price.toFixed(2) }}</span>
                    <span v-else class="text-base font-bold text-primary-500">${{ product.price.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- No results -->
            <div v-else-if="query && !searching && products.length === 0" class="text-center py-12">
              <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p class="text-sm text-surface-400">{{ $t('common.noResults') }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchHistory } from '@/composables/useSearchHistory'
import api from '@/services/api'

interface Product {
  _id: string
  name: string
  price: number
  discount: number
  images: { public_id: string; secure_url: string }[]
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const searchHistory = useSearchHistory()

const query = ref('')
const products = ref<Product[]>([])
const searching = ref(false)
const error = ref<string | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const isListening = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Auto-focus input when overlay opens
watch(() => props.visible, async (val) => {
  if (val) {
    await nextTick()
    searchInputRef.value?.focus()
  } else {
    query.value = ''
    products.value = []
    error.value = null
  }
})

// Escape key closes the overlay
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})

function close() {
  emit('close')
}

function onInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (!query.value.trim()) {
    products.value = []
    searching.value = false
    return
  }
  searching.value = true
  searchTimeout = setTimeout(() => fetchProducts(), 300)
}

async function fetchProducts() {
  if (!query.value.trim()) {
    products.value = []
    searching.value = false
    return
  }
  error.value = null
  try {
    const data: any = await api.get('/products', {
      params: { search: query.value, limit: 8 },
    })
    products.value = data.products || []
  } catch (err: any) {
    error.value = err.message || 'Search failed'
  } finally {
    searching.value = false
  }
}

function selectSuggestion(s: string) {
  query.value = s
  searchHistory.addSearch(s)
  searching.value = true
  fetchProducts()
}

function handleEnter() {
  if (!query.value.trim()) return
  searchHistory.addSearch(query.value.trim())
  close()
  router.push({ path: '/search', query: { q: query.value.trim() } })
}

function goToProduct(id: string) {
  searchHistory.addSearch(query.value.trim())
  close()
  router.push(`/product/${id}`)
}

// Voice Search
function toggleVoiceSearch() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return
  if (isListening.value) {
    isListening.value = false
    return
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const recognition = new SpeechRecognition()
  recognition.lang = 'en-US'
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onresult = (event: any) => {
    const q = event.results[0][0].transcript
    query.value = q
    searchHistory.addSearch(q)
    searching.value = true
    fetchProducts()
    isListening.value = false
  }

  recognition.onerror = () => { isListening.value = false }
  recognition.onend = () => { isListening.value = false }

  isListening.value = true
  recognition.start()
}
</script>

<style scoped>
.search-overlay-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.search-overlay-leave-active {
  transition: all 0.2s ease-in;
}
.search-overlay-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.search-overlay-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
