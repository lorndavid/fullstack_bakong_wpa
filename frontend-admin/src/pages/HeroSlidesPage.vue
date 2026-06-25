<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-surface-800 dark:text-white">Hero Slides</h2>
      <button @click="openCreateModal" class="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-all flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Slide
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-sm text-surface-500">Loading slides...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <p class="text-red-500 text-sm mb-3">{{ error }}</p>
      <button @click="fetchSlides" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">Retry</button>
    </div>

    <!-- Slides Grid -->
    <div v-else-if="slides.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">No slides yet</h3>
      <p class="text-sm text-surface-500 mb-4">Add your first hero slide to display on the homepage carousel</p>
      <button @click="openCreateModal" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">Add Slide</button>
    </div>

    <!-- Slides List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="slide in slides"
        :key="slide._id"
        class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden group"
      >
        <!-- Image Preview -->
        <div class="relative aspect-video bg-surface-100 dark:bg-surface-700 overflow-hidden">
          <img :src="slide.image?.secure_url" :alt="slide.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div class="absolute top-2 right-2 flex gap-1.5">
            <span class="px-2 py-0.5 text-xs font-semibold rounded-full"
              :class="slide.active ? 'bg-accent-100 text-accent-700' : 'bg-surface-200 text-surface-500'">
              {{ slide.active ? 'Active' : 'Inactive' }}
            </span>
            <span class="px-2 py-0.5 bg-surface-900/60 text-white text-xs rounded-full">#{{ slide.order }}</span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-1.5">
          <h4 class="font-semibold text-surface-800 dark:text-white truncate">{{ slide.title || 'Untitled' }}</h4>
          <p v-if="slide.subtitle" class="text-xs text-surface-500 truncate">{{ slide.subtitle }}</p>
          <p v-if="slide.description" class="text-xs text-surface-400 line-clamp-2">{{ slide.description }}</p>

          <div class="flex items-center justify-between pt-2 border-t border-surface-100 dark:border-surface-700">
            <div class="flex gap-1.5">
              <button @click="openEditModal(slide)" class="p-1.5 text-surface-400 hover:text-primary-500 transition-colors" title="Edit">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button @click="confirmDelete(slide)" class="p-1.5 text-surface-400 hover:text-red-500 transition-colors" title="Delete">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
            <div class="flex gap-1">
              <button @click="moveSlide(slide._id, 'up')" :disabled="slide.order <= 0" class="p-1 text-surface-400 hover:text-surface-600 disabled:opacity-30" title="Move up">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
              </button>
              <button @click="moveSlide(slide._id, 'down')" :disabled="slide.order >= slides.length - 1" class="p-1 text-surface-400 hover:text-surface-600 disabled:opacity-30" title="Move down">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Slide-in Panel: Create/Edit Slide -->
    <div v-if="showModal" class="fixed inset-0 z-50" @click.self="closeModal">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="fixed top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-surface-800 shadow-2xl animate-slide-in-right flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-surface-800 dark:text-white">{{ editingSlide ? 'Edit Slide' : 'Add Slide' }}</h3>
              <p class="text-xs text-surface-400">{{ editingSlide ? 'Update hero slide details' : 'Create a new hero slide' }}</p>
            </div>
          </div>
          <button @click="closeModal" class="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <form @submit.prevent="saveSlide" class="space-y-5">
            <!-- Image Upload -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Slide Image *</label>
              <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange"
                class="w-full text-sm text-surface-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-600 dark:file:text-primary-400 hover:file:bg-primary-100 transition-all" />
              <p class="text-xs text-surface-400 mt-1.5">Recommended: 1920x600px or similar landscape ratio</p>
            </div>
            <!-- Image Preview -->
            <div v-if="imagePreview || (editingSlide && editingSlide.image?.secure_url)" class="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-surface-200 dark:border-surface-600">
              <img :src="imagePreview || editingSlide?.image?.secure_url" class="w-full h-full object-cover" />
              <button v-if="imagePreview" type="button" @click="removeImage" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-sm transition-all">×</button>
            </div>

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Title</label>
              <input v-model="form.title" maxlength="100" class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" placeholder="Shop Smarter, Save Bigger" />
            </div>
            <!-- Subtitle -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Subtitle <span class="text-surface-400 font-normal">(badge text)</span></label>
              <input v-model="form.subtitle" maxlength="100" class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" placeholder="Summer Sale 2024" />
            </div>
            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Description</label>
              <textarea v-model="form.description" rows="2" maxlength="200" class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 resize-none transition-all"></textarea>
            </div>
            <!-- Link -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Link <span class="text-surface-400 font-normal">(e.g., /search)</span></label>
              <input v-model="form.link" class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" placeholder="/search" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <!-- Order -->
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Display Order</label>
                <input v-model.number="form.order" type="number" min="0" class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" />
              </div>
              <!-- Active -->
              <div class="flex items-end pb-2">
                <label class="flex items-center gap-2.5 cursor-pointer p-3 bg-surface-50 dark:bg-surface-700/30 rounded-lg">
                  <input v-model="form.active" type="checkbox" class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500" />
                  <span class="text-sm font-medium text-surface-700 dark:text-surface-200">Active</span>
                </label>
              </div>
            </div>

            <div v-if="submitError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3.5 rounded-xl">{{ submitError }}</div>
          </form>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 flex-shrink-0">
          <button type="button" @click="closeModal" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-surface-700 transition-all">Cancel</button>
          <button type="submit" @click="saveSlide" :disabled="saving" class="flex-1 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-all shadow-sm">
            <span v-if="saving" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Saving...
            </span>
            <span v-else>{{ editingSlide ? 'Update' : 'Create' }} Slide</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Slide-in Panel: Delete Confirmation -->
    <div v-if="deletingSlide" class="fixed inset-0 z-50">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="deletingSlide = null"></div>
      <div class="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-surface-800 shadow-2xl animate-slide-in-right flex flex-col">
        <div class="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
          </div>
          <h3 class="text-xl font-bold text-surface-800 dark:text-white mb-2">Delete Slide</h3>
          <p class="text-sm text-surface-500 mb-8">Are you sure you want to delete this slide? This action cannot be undone.</p>
          <div v-if="deleteError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3.5 rounded-xl mb-4 w-full">{{ deleteError }}</div>
        </div>
        <div class="flex items-center gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <button @click="deletingSlide = null" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-surface-700 transition-all">Cancel</button>
          <button @click="deleteSlide" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-all shadow-sm">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface HeroSlide {
  _id: string
  image: { public_id: string; secure_url: string }
  title: string
  subtitle: string
  description: string
  link: string
  order: number
  active: boolean
  createdAt: string
}

const slides = ref<HeroSlide[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const showModal = ref(false)
const editingSlide = ref<HeroSlide | null>(null)
const saving = ref(false)
const submitError = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const form = ref({
  title: '',
  subtitle: '',
  description: '',
  link: '/search',
  order: 0,
  active: true,
})

const deletingSlide = ref<HeroSlide | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

onMounted(() => {
  fetchSlides()
})

async function fetchSlides() {
  loading.value = true
  error.value = null
  try {
    const data: any = await api.get('/hero-slides/all')
    slides.value = data.slides || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load slides'
  } finally {
    loading.value = false
  }
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  }
}

function removeImage() {
  selectedFile.value = null
  imagePreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function openCreateModal() {
  editingSlide.value = null
  form.value = { title: '', subtitle: '', description: '', link: '/search', order: slides.value.length, active: true }
  selectedFile.value = null
  imagePreview.value = null
  submitError.value = null
  if (fileInput.value) fileInput.value.value = ''
  showModal.value = true
}

function openEditModal(slide: HeroSlide) {
  editingSlide.value = slide
  form.value = {
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    description: slide.description || '',
    link: slide.link || '/search',
    order: slide.order || 0,
    active: slide.active,
  }
  selectedFile.value = null
  imagePreview.value = null
  submitError.value = null
  if (fileInput.value) fileInput.value.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingSlide.value = null
  submitError.value = null
}

async function saveSlide() {
  saving.value = true
  submitError.value = null
  try {
    const formData = new FormData()
    formData.append('title', form.value.title)
    formData.append('subtitle', form.value.subtitle)
    formData.append('description', form.value.description)
    formData.append('link', form.value.link)
    formData.append('order', String(form.value.order))
    formData.append('active', form.value.active ? 'true' : 'false')

    if (selectedFile.value) {
      formData.append('image', selectedFile.value)
    } else if (!editingSlide.value) {
      submitError.value = 'Please select an image'
      saving.value = false
      return
    }

    if (editingSlide.value) {
      await api.put(`/hero-slides/${editingSlide.value._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      await api.post('/hero-slides', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    closeModal()
    fetchSlides()
  } catch (err: any) {
    submitError.value = err.message || 'Failed to save slide'
  } finally {
    saving.value = false
  }
}

function confirmDelete(slide: HeroSlide) {
  deletingSlide.value = slide
  deleteError.value = null
}

async function deleteSlide() {
  if (!deletingSlide.value) return
  deleting.value = true
  deleteError.value = null
  try {
    await api.delete(`/hero-slides/${deletingSlide.value._id}`)
    deletingSlide.value = null
    fetchSlides()
  } catch (err: any) {
    deleteError.value = err.message || 'Failed to delete slide'
  } finally {
    deleting.value = false
  }
}

async function moveSlide(id: string, direction: 'up' | 'down') {
  const idx = slides.value.findIndex(s => s._id === id)
  if (idx === -1) return

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= slides.value.length) return

  const current = slides.value[idx]
  const swap = slides.value[swapIdx]
  const tempOrder = current.order
  current.order = swap.order
  swap.order = tempOrder

  try {
    // Update both slides' order
    await Promise.all([
      api.put(`/hero-slides/${current._id}`, { order: current.order }),
      api.put(`/hero-slides/${swap._id}`, { order: swap.order }),
    ])
    fetchSlides()
  } catch {
    fetchSlides() // Revert on error
  }
}
</script>

<style scoped>
.animate-slide-in-right {
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
