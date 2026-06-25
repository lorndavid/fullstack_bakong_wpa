<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('categories.title') }}</h2>
      </div>
      <div class="flex items-center gap-2">
        <!-- View Toggle -->
        <div class="flex items-center bg-surface-100 dark:bg-surface-700 rounded-lg p-0.5 border border-surface-200 dark:border-surface-600">
          <button @click="viewMode = 'grid'"
            class="p-1.5 rounded-md transition-all duration-150"
            :class="viewMode === 'grid' ? 'bg-white dark:bg-surface-600 shadow-sm text-primary-500' : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
          </button>
          <button @click="viewMode = 'list'"
            class="p-1.5 rounded-md transition-all duration-150"
            :class="viewMode === 'list' ? 'bg-white dark:bg-surface-600 shadow-sm text-primary-500' : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          </button>
        </div>
        <button @click="openCreateModal" class="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-all flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          {{ $t('categories.addCategory') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-sm text-surface-500">{{ $t('common.loadingCategories') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <p class="text-red-500 text-sm mb-3">{{ error }}</p>
      <button @click="fetchCategories" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="categories.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
      </svg>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">{{ $t('categories.noCategories') }}</h3>
      <p class="text-sm text-surface-500 mb-4">{{ $t('categories.noCategoriesDesc') }}</p>
      <button @click="openCreateModal" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('categories.addCategory') }}</button>
    </div>

    <!-- List View (Table) -->
    <div v-if="viewMode === 'list'" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('categories.icon') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('categories.name') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('categories.created') }}</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
            <tr v-for="cat in categories" :key="cat._id" class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
              <td class="px-4 py-3">
                <div class="w-10 h-10 bg-primary-50 dark:bg-primary-900/50 rounded-xl flex items-center justify-center text-xl">
                  {{ cat.icon }}
                </div>
              </td>
              <td class="px-4 py-3">
                <p class="text-sm font-medium text-surface-800 dark:text-white">{{ cat.name }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-surface-500">{{ formatDate(cat.createdAt) }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(cat)" class="p-1.5 text-surface-400 hover:text-primary-500 transition-colors" :title="$t('common.edit')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="confirmDelete(cat)" class="p-1.5 text-surface-400 hover:text-red-500 transition-colors" :title="$t('common.delete')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Grid View (Cards) -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      <div v-for="cat in categories" :key="cat._id"
        class="bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 p-5 text-center group cursor-pointer border border-surface-100 dark:border-surface-700 hover:border-primary-200 dark:hover:border-primary-800"
        @click="openEditModal(cat)">
        <div class="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
          {{ cat.icon }}
        </div>
        <h3 class="text-sm font-semibold text-surface-800 dark:text-white truncate">{{ cat.name }}</h3>
        <p class="text-[10px] text-surface-400 mt-1">{{ formatDate(cat.createdAt) }}</p>
        <div class="mt-3 pt-3 border-t border-surface-100 dark:border-surface-700 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click.stop="openEditModal(cat)" class="p-1.5 text-primary-500 hover:text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors" :title="$t('common.edit')">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button @click.stop="confirmDelete(cat)" class="p-1.5 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" :title="$t('common.delete')">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Slide-in Panel: Create/Edit Category -->
    <div v-if="showModal" class="fixed inset-0 z-50" @click.self="closeModal">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="fixed top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-surface-800 shadow-2xl animate-slide-in-right flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-surface-800 dark:text-white">{{ editingCategory ? $t('categories.editCategory') : $t('categories.addCategory') }}</h3>
              <p class="text-xs text-surface-400">{{ editingCategory ? 'Update category details' : 'Create a new category' }}</p>
            </div>
          </div>
          <button @click="closeModal" class="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <form @submit.prevent="saveCategory" class="space-y-5">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('categories.categoryName') }}</label>
              <input v-model="form.name" required :placeholder="'e.g. Electronics'"
                class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" />
            </div>
            <!-- Icon -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('categories.iconLabel') }}</label>
              <div class="flex gap-3">
                <input v-model="form.icon" required :placeholder="$t('categories.iconPlaceholder')" maxlength="4"
                  class="flex-1 px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 text-center text-2xl transition-all" />
                <div class="w-12 h-12 bg-primary-50 dark:bg-primary-900/50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {{ form.icon || '?' }}
                </div>
              </div>
              <p class="text-xs text-surface-400 mt-1.5">{{ $t('categories.iconHint') }}</p>
            </div>
            <!-- Quick emoji picker -->
            <div>
              <label class="block text-xs font-medium text-surface-500 mb-2">{{ $t('categories.quickPick') }}</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="emoji in emojis" :key="emoji" type="button" @click="form.icon = emoji"
                  class="w-9 h-9 flex items-center justify-center rounded-lg text-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  :class="form.icon === emoji ? 'bg-primary-100 dark:bg-primary-900/50 ring-2 ring-primary-500' : ''">
                  {{ emoji }}
                </button>
              </div>
            </div>
            <div v-if="submitError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3.5 rounded-xl">
              {{ submitError }}
            </div>
          </form>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 flex-shrink-0">
          <button type="button" @click="closeModal" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-surface-700 transition-all">
            {{ $t('common.cancel') }}
          </button>
          <button type="submit" @click="saveCategory" :disabled="saving" class="flex-1 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-all shadow-sm">
            <span v-if="saving" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ $t('common.saving') }}
            </span>
            <span v-else>{{ editingCategory ? $t('categories.updateCategory') : $t('categories.createCategory') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Slide-in Panel: Delete Confirmation -->
    <div v-if="deletingCategory" class="fixed inset-0 z-50">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="deletingCategory = null"></div>
      <div class="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-surface-800 shadow-2xl animate-slide-in-right flex flex-col">
        <div class="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
          </div>
          <h3 class="text-xl font-bold text-surface-800 dark:text-white mb-2">{{ $t('categories.deleteTitle') }}</h3>
          <p class="text-sm text-surface-500 mb-8" v-html="$t('categories.deleteDesc', { name: deletingCategory.name })"></p>
        </div>
        <div class="flex items-center gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <button @click="deletingCategory = null" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-surface-700 transition-all">{{ $t('common.cancel') }}</button>
          <button @click="deleteCategory" :disabled="saving" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-all shadow-sm">
            {{ saving ? $t('common.deleting') : $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface Category {
  _id: string
  name: string
  icon: string
  createdAt: string
}

const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')

// Modal
const showModal = ref(false)
const editingCategory = ref<Category | null>(null)
const saving = ref(false)
const submitError = ref<string | null>(null)

const form = ref({ name: '', icon: '📦' })

const deletingCategory = ref<Category | null>(null)

const emojis = ['📱', '👕', '🏠', '💄', '⚽', '📚', '🍕', '⌚', '🎮', '🎵', '🎨', '💻', '📷', '🔧', '🎁', '👗', '👟', '🧢', '💎', '🛒']

onMounted(() => {
  fetchCategories()
})

async function fetchCategories() {
  loading.value = true
  error.value = null
  try {
    const data: any = await api.get('/categories')
    categories.value = data.categories || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load categories'
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingCategory.value = null
  form.value = { name: '', icon: '📦' }
  submitError.value = null
  showModal.value = true
}

function openEditModal(cat: Category) {
  editingCategory.value = cat
  form.value = { name: cat.name, icon: cat.icon }
  submitError.value = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingCategory.value = null
  submitError.value = null
}

async function saveCategory() {
  saving.value = true
  submitError.value = null
  try {
    if (editingCategory.value) {
      await api.put(`/categories/${editingCategory.value._id}`, form.value)
    } else {
      await api.post('/categories', form.value)
    }
    closeModal()
    await fetchCategories()
  } catch (err: any) {
    submitError.value = err.message || 'Failed to save category'
  } finally {
    saving.value = false
  }
}

function confirmDelete(cat: Category) {
  deletingCategory.value = cat
}

async function deleteCategory() {
  if (!deletingCategory.value) return
  saving.value = true
  try {
    await api.delete(`/categories/${deletingCategory.value._id}`)
    deletingCategory.value = null
    await fetchCategories()
  } catch (err: any) {
    alert(err.message || 'Failed to delete category')
  } finally {
    saving.value = false
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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
