<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-surface-800 dark:text-white">Products</h2>
      <button @click="openCreateModal" class="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-all flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Product
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input v-model="searchQuery" @input="debouncedSearch" type="text" placeholder="Search products..."
            class="w-full pl-10 pr-4 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
        </div>
        <select v-model="categoryFilter" @change="fetchProducts" class="px-4 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="p-8 text-center">
        <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-2 text-sm text-surface-500">Loading products...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <p class="text-red-500 text-sm mb-3">{{ error }}</p>
      <button @click="fetchProducts" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">Retry</button>
    </div>

    <!-- Empty -->
    <div v-else-if="products.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">No products found</h3>
      <p class="text-sm text-surface-500 mb-4">{{ searchQuery ? 'Try a different search term' : 'Add your first product to get started' }}</p>
      <button @click="openCreateModal" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">Add Product</button>
    </div>

    <!-- Table -->
    <div v-else class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Product</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Category</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Price</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Discount</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Stock</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Sold</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
            <tr v-for="product in products" :key="product._id" class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-lg flex-shrink-0 overflow-hidden">
                    <img v-if="product.images && product.images[0]" :src="product.images[0].secure_url" :alt="product.name" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-surface-800 dark:text-white">{{ product.name }}</p>
                    <p class="text-xs text-surface-400">#{{ product._id.slice(-8) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{{ getCategoryName(product.category) }}</td>
              <td class="px-4 py-3 text-sm font-medium text-surface-800 dark:text-white">${{ product.price.toFixed(2) }}</td>
              <td class="px-4 py-3">
                <span v-if="product.discount > 0" class="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded">-{{ product.discount }}%</span>
                <span v-else class="text-xs text-surface-400">—</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm" :class="product.stock <= 10 ? 'text-red-500 font-medium' : 'text-surface-600 dark:text-surface-300'">{{ product.stock }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{{ product.sold }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(product)" class="p-1.5 text-surface-400 hover:text-primary-500 transition-colors" title="Edit">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="confirmDelete(product)" class="p-1.5 text-surface-400 hover:text-red-500 transition-colors" title="Delete">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700">
        <p class="text-sm text-surface-500">
          Showing {{ products.length }} of {{ pagination.total }} products
        </p>
        <div class="flex items-center gap-2">
          <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1"
            class="px-3 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed">
            Previous
          </button>
          <button
            v-for="p in pagination.pages"
            :key="p"
            @click="goToPage(p)"
            class="px-3 py-1.5 text-sm rounded-lg transition-colors"
            :class="p === pagination.page ? 'bg-primary-500 text-white' : 'border border-surface-200 dark:border-surface-600 text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700'"
          >
            {{ p }}
          </button>
          <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page >= pagination.pages"
            class="px-3 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="fixed inset-0 bg-black/50" @click="closeModal"></div>
      <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        <div class="sticky top-0 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 px-6 py-4 flex items-center justify-between z-10">
          <h3 class="text-lg font-bold text-surface-800 dark:text-white">{{ editingProduct ? 'Edit Product' : 'Add Product' }}</h3>
          <button @click="closeModal" class="p-1 text-surface-400 hover:text-surface-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <form @submit.prevent="saveProduct" class="p-6 space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Product Name *</label>
            <input v-model="form.name" required
              class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Description *</label>
            <textarea v-model="form.description" required rows="3"
              class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 resize-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <!-- Price -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Price ($) *</label>
              <input v-model.number="form.price" type="number" step="0.01" min="0.01" required
                class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50" />
            </div>
            <!-- Discount -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Discount (%)</label>
              <input v-model.number="form.discount" type="number" min="0" max="100"
                class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50" />
            </div>
            <!-- Stock -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Stock *</label>
              <input v-model.number="form.stock" type="number" min="0" required
                class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50" />
            </div>
            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Category *</label>
              <select v-model="form.category" required
                class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50">
                <option value="">Select category</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
              </select>
            </div>
          </div>
          <!-- Featured -->
          <div class="flex items-center gap-2">
            <input v-model="form.featured" type="checkbox" id="featured" class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500" />
            <label for="featured" class="text-sm font-medium text-surface-700 dark:text-surface-200">Featured Product</label>
          </div>
          <!-- Image URL (fallback when no file upload) -->
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Image URL <span class="text-surface-400 font-normal">(optional fallback)</span></label>
            <input v-model="form.imageUrl" type="url" placeholder="https://example.com/product-image.jpg"
              class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50" />
            <p class="text-xs text-surface-400 mt-1">Paste a public image URL. File upload takes priority over URL.</p>
          </div>
          <!-- File Upload -->
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Upload Image File <span class="text-surface-400 font-normal">(recommended)</span></label>
            <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange"
              class="w-full text-sm text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-600 dark:file:text-primary-400 hover:file:bg-primary-100" />
          </div>
          <!-- Image Preview -->
          <div v-if="imagePreview || form.imageUrl" class="relative w-24 h-24 rounded-lg overflow-hidden border border-surface-200 dark:border-surface-600">
            <img :src="imagePreview || form.imageUrl" class="w-full h-full object-cover" />
            <button v-if="imagePreview" type="button" @click="removeImage" class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
            <button v-else type="button" @click="form.imageUrl = ''" class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
          </div>
          <!-- Validation Errors -->
          <div v-if="Object.keys(fieldErrors).length > 0" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 space-y-1">
            <p class="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">Please fix these errors:</p>
            <ul class="list-disc list-inside text-xs text-red-500 space-y-0.5">
              <li v-for="(msg, field) in fieldErrors" :key="field">
                <span class="font-medium capitalize">{{ field }}:</span> {{ msg }}
              </li>
            </ul>
          </div>
          <!-- Submit Error -->
          <div v-else-if="submitError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">
            {{ submitError }}
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeModal" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700">
              Cancel
            </button>
            <button type="submit" :disabled="saving" class="flex-1 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50">
              <span v-if="saving" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Saving...
              </span>
              <span v-else>{{ editingProduct ? 'Update' : 'Create' }} Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="deletingProduct" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="deletingProduct = null"></div>
      <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in text-center">
        <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        </div>
        <h3 class="text-lg font-bold text-surface-800 dark:text-white mb-2">Delete Product</h3>
        <p class="text-sm text-surface-500 mb-6">Are you sure you want to delete <strong>{{ deletingProduct.name }}</strong>? This action cannot be undone.</p>
        <div v-if="deleteError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4">{{ deleteError }}</div>
        <div class="flex gap-3">
          <button @click="deletingProduct = null" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-surface-50">Cancel</button>
          <button @click="deleteProduct" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">
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

interface Category {
  _id: string
  name: string
  icon: string
}

interface ProductImage {
  public_id: string
  secure_url: string
}

interface Product {
  _id: string
  name: string
  description: string
  price: number
  stock: number
  discount: number
  images: ProductImage[]
  category: Category | string
  rating: number
  numReviews: number
  sold: number
  featured: boolean
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const categoryFilter = ref('')
const pagination = ref<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 })

const showModal = ref(false)
const editingProduct = ref<Product | null>(null)
const saving = ref(false)
const submitError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const form = ref({
  name: '',
  description: '',
  // price defaults to empty string so user MUST type a valid value (0 fails model min:0.01)
  price: undefined as number | undefined,
  stock: undefined as number | undefined,
  discount: 0,
  category: '',
  featured: false,
  imageUrl: '',
})

const deletingProduct = ref<Product | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function getCategoryName(cat: string | Category | null | undefined): string {
  if (!cat) return 'N/A'
  if (typeof cat === 'object') return cat.name
  const found = categories.value.find((c) => c._id === cat)
  return found?.name || 'N/A'
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})

async function fetchCategories() {
  try {
    const data: any = await api.get('/categories')
    categories.value = data.categories || []
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  }
}

async function fetchProducts() {
  loading.value = true
  error.value = null
  try {
    const params: Record<string, any> = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }
    if (searchQuery.value) params.search = searchQuery.value
    if (categoryFilter.value) params.category = categoryFilter.value

    const data: any = await api.get('/products', { params })
    products.value = data.products || []
    pagination.value = data.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
  } catch (err: any) {
    error.value = err.message || 'Failed to load products'
  } finally {
    loading.value = false
  }
}

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    fetchProducts()
  }, 400)
}

function goToPage(page: number) {
  if (page < 1 || page > pagination.value.pages) return
  pagination.value.page = page
  fetchProducts()
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
  editingProduct.value = null
  form.value = { name: '', description: '', price: undefined, stock: undefined, discount: 0, category: '', featured: false, imageUrl: '' }
  selectedFile.value = null
  imagePreview.value = null
  submitError.value = null
  fieldErrors.value = {}
  if (fileInput.value) fileInput.value.value = ''
  showModal.value = true
}

function openEditModal(product: Product) {
  editingProduct.value = product
  const catId = typeof product.category === 'object' ? product.category._id : product.category
  form.value = {
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    discount: product.discount || 0,
    category: catId || '',
    featured: product.featured,
    imageUrl: product.images?.[0]?.secure_url || '',
  }
  selectedFile.value = null
  imagePreview.value = null
  submitError.value = null
  fieldErrors.value = {}
  if (fileInput.value) fileInput.value.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingProduct.value = null
  submitError.value = null
}

async function saveProduct() {
  // Client-side validation
  if (!form.value.price || form.value.price <= 0) {
    submitError.value = 'Price must be greater than $0.00'
    saving.value = false
    return
  }
  if (!form.value.stock || form.value.stock < 0) {
    submitError.value = 'Stock cannot be negative'
    saving.value = false
    return
  }
  if (!form.value.category) {
    submitError.value = 'Please select a category'
    saving.value = false
    return
  }

  saving.value = true
  submitError.value = null
  fieldErrors.value = {}
  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('description', form.value.description)
    formData.append('price', String(form.value.price))
    formData.append('stock', String(form.value.stock))
    formData.append('discount', String(form.value.discount))
    formData.append('category', form.value.category)
    // Send featured as 'true' or 'false' string (backend parses it)
    formData.append('featured', form.value.featured ? 'true' : 'false')

    if (selectedFile.value) {
      formData.append('images', selectedFile.value)
    } else if (form.value.imageUrl && !editingProduct.value) {
      // Send imageUrl as fallback when no file is uploaded (create only)
      formData.append('imageUrl', form.value.imageUrl)
    } else if (form.value.imageUrl && editingProduct.value) {
      // For updates, only send if it changed
      const currentUrl = editingProduct.value.images?.[0]?.secure_url || ''
      if (form.value.imageUrl !== currentUrl) {
        formData.append('imageUrl', form.value.imageUrl)
      }
    }

    if (editingProduct.value) {
      await api.put(`/products/${editingProduct.value._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    closeModal()
    fetchProducts()
  } catch (err: any) {
    // Show detailed validation errors from the API
    if (err.errors) {
      fieldErrors.value = err.errors
      const firstError = Object.values(err.errors)[0]
      submitError.value = String(firstError)
    } else {
      submitError.value = err.message || 'Failed to save product'
    }
  } finally {
    saving.value = false
  }
}

function confirmDelete(product: Product) {
  deletingProduct.value = product
  deleteError.value = null
}

async function deleteProduct() {
  if (!deletingProduct.value) return
  deleting.value = true
  deleteError.value = null
  try {
    await api.delete(`/products/${deletingProduct.value._id}`)
    deletingProduct.value = null
    fetchProducts()
  } catch (err: any) {
    deleteError.value = err.message || 'Failed to delete product'
  } finally {
    deleting.value = false
  }
}
</script>
