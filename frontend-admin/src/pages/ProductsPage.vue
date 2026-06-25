<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        </div>
        <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('products.title') }}</h2>
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
          {{ $t('products.addProduct') }}
        </button>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input v-model="searchQuery" @input="debouncedSearch" type="text" :placeholder="$t('common.search') + '...'"
            class="w-full pl-10 pr-4 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
        </div>
        <select v-model="categoryFilter" @change="fetchProducts" class="px-4 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50">
          <option value="">{{ $t('common.allCategories') }}</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="p-8 text-center">
        <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-2 text-sm text-surface-500">{{ $t('common.loadingProducts') }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <p class="text-red-500 text-sm mb-3">{{ error }}</p>
      <button @click="fetchProducts" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="products.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">{{ $t('products.noProducts') }}</h3>
      <p class="text-sm text-surface-500 mb-4">{{ searchQuery ? $t('common.tryDifferentSearch') : $t('products.addFirstProduct') }}</p>
      <button @click="openCreateModal" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('products.addProduct') }}</button>
    </div>

    <!-- List View (Table) -->
    <div v-if="viewMode === 'list'" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('products.product') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('products.category') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('products.price') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('products.discount') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('products.stock') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('products.sold') }}</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('common.actions') }}</th>
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
                <span v-else class="text-xs text-surface-400">{{ $t('products.noDiscount') }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm" :class="product.stock <= 10 ? 'text-red-500 font-medium' : 'text-surface-600 dark:text-surface-300'">{{ product.stock }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{{ product.sold }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openEditModal(product)" class="p-1.5 text-surface-400 hover:text-primary-500 transition-colors" :title="$t('common.edit')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="confirmDelete(product)" class="p-1.5 text-surface-400 hover:text-red-500 transition-colors" :title="$t('common.delete')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination (List View) -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700">
        <p class="text-sm text-surface-500">
          {{ $t('products.showingOf', { count: products.length, total: pagination.total }) }}
        </p>
        <div class="flex items-center gap-2">
          <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1"
            class="px-3 py-1.5 text-sm border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed">
            {{ $t('common.previous') }}
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
            {{ $t('common.next') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Grid View (Cards) -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="product in products" :key="product._id"
        class="bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group border border-surface-100 dark:border-surface-700">
        <!-- Image -->
        <div class="aspect-square bg-surface-100 dark:bg-surface-700 overflow-hidden relative">
          <img v-if="product.images && product.images[0]" :src="product.images[0].secure_url" :alt="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="w-12 h-12 text-surface-300 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <!-- Discount Badge -->
          <div v-if="product.discount > 0" class="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-sm">
            -{{ product.discount }}%
          </div>
          <!-- Stock Badge -->
          <div v-if="product.stock <= 5" class="absolute top-2 right-2 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-lg shadow-sm">
            Low Stock
          </div>
        </div>
        <!-- Content -->
        <div class="p-4 space-y-2">
          <div>
            <p class="text-xs text-surface-400 uppercase tracking-wider">{{ getCategoryName(product.category) }}</p>
            <h3 class="text-sm font-semibold text-surface-800 dark:text-white line-clamp-1">{{ product.name }}</h3>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span v-if="product.discount > 0" class="text-xs text-surface-400 line-through">${{ product.price.toFixed(2) }}</span>
              <span class="text-base font-bold text-surface-800 dark:text-white">${{ ((product.price * (100 - product.discount)) / 100).toFixed(2) }}</span>
            </div>
            <span class="text-xs" :class="product.stock <= 10 ? 'text-red-500 font-medium' : 'text-surface-400'">{{ product.stock }} in stock</span>
          </div>
          <!-- Actions -->
          <div class="flex items-center gap-2 pt-2 border-t border-surface-100 dark:border-surface-700">
            <button @click="openEditModal(product)" class="flex-1 py-1.5 text-xs font-medium text-primary-500 bg-primary-50 dark:bg-primary-900/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
              Edit
            </button>
            <button @click="confirmDelete(product)" class="py-1.5 px-2 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Slide-in Panel (Create/Edit) -->
    <div v-if="showPanel" class="fixed inset-0 z-50" @click.self="closePanel">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closePanel"></div>
      <div class="fixed top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-surface-800 shadow-2xl animate-slide-in-right flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-surface-800 dark:text-white">{{ editingProduct ? $t('products.editProduct') : $t('products.addProduct') }}</h3>
              <p class="text-xs text-surface-400">{{ editingProduct ? 'Update product details' : 'Create a new product' }}</p>
            </div>
          </div>
          <button @click="closePanel" class="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Form Body (scrollable) -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <form @submit.prevent="saveProduct" class="space-y-5">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('products.productName') }}</label>
              <input v-model="form.name" required
                class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" />
            </div>
            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('products.description') }}</label>
              <textarea v-model="form.description" required rows="3"
                class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 resize-none transition-all"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('products.priceLabel') }}</label>
                <input v-model.number="form.price" type="number" step="0.01" min="0.01" required
                  class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('products.discountLabel') }}</label>
                <input v-model.number="form.discount" type="number" min="0" max="100"
                  class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('products.stockLabel') }}</label>
                <input v-model.number="form.stock" type="number" min="0" required
                  class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('products.categoryLabel') }}</label>
                <select v-model="form.category" required
                  class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all">
                  <option value="">{{ $t('products.selectCategory') }}</option>
                  <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
                </select>
              </div>
            </div>
            <!-- Featured -->
            <div class="flex items-center gap-2.5 p-3 bg-surface-50 dark:bg-surface-700/30 rounded-lg">
              <input v-model="form.featured" type="checkbox" id="featured" class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500" />
              <label for="featured" class="text-sm font-medium text-surface-700 dark:text-surface-200 cursor-pointer">{{ $t('products.featuredProduct') }}</label>
            </div>
            <!-- Image URL -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('products.imageUrl') }} <span class="text-surface-400 font-normal">{{ $t('products.imageUrlFallback') }}</span></label>
              <input v-model="form.imageUrl" type="url" :placeholder="'https://example.com/product-image.jpg'"
                class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50 transition-all" />
            </div>
            <!-- File Upload -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('products.uploadImageFile') }} <span class="text-surface-400 font-normal">{{ $t('products.uploadRecommended') }}</span></label>
              <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange"
                class="w-full text-sm text-surface-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-600 dark:file:text-primary-400 hover:file:bg-primary-100 transition-all" />
            </div>
            <!-- Image Preview -->
            <div v-if="imagePreview || form.imageUrl" class="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-surface-200 dark:border-surface-600">
              <img :src="imagePreview || form.imageUrl" class="w-full h-full object-cover" />
              <button v-if="imagePreview" type="button" @click="removeImage" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-sm transition-all">×</button>
              <button v-else type="button" @click="form.imageUrl = ''" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-sm transition-all">×</button>
            </div>
            <!-- Validation Errors -->
            <div v-if="Object.keys(fieldErrors).length > 0" class="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 space-y-1.5">
              <p class="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">{{ $t('common.error') }}:</p>
              <ul class="list-disc list-inside text-xs text-red-500 space-y-0.5">
                <li v-for="(msg, field) in fieldErrors" :key="field">
                  <span class="font-medium capitalize">{{ field }}:</span> {{ msg }}
                </li>
              </ul>
            </div>
            <!-- Submit Error -->
            <div v-else-if="submitError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3.5 rounded-xl">
              {{ submitError }}
            </div>
          </form>
        </div>

        <!-- Footer Actions (sticky) -->
        <div class="flex items-center gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 flex-shrink-0">
          <button type="button" @click="closePanel" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-surface-700 transition-all">
            {{ $t('common.cancel') }}
          </button>
          <button type="submit" @click="saveProduct" :disabled="saving" class="flex-1 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-all shadow-sm">
            <span v-if="saving" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ $t('common.saving') }}
            </span>
            <span v-else>{{ editingProduct ? $t('products.updateProduct') : $t('products.createProduct') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation (slide-in) -->
    <div v-if="deletingProduct" class="fixed inset-0 z-50">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="deletingProduct = null"></div>
      <div class="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-surface-800 shadow-2xl animate-slide-in-right flex flex-col">
        <div class="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
          </div>
          <h3 class="text-xl font-bold text-surface-800 dark:text-white mb-2">{{ $t('products.deleteTitle') }}</h3>
          <p class="text-sm text-surface-500 mb-8" v-html="$t('products.deleteDesc', { name: deletingProduct.name })"></p>
          <div v-if="deleteError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3.5 rounded-xl mb-4 w-full">{{ deleteError }}</div>
        </div>
        <div class="flex items-center gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <button @click="deletingProduct = null" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-surface-700 transition-all">{{ $t('common.cancel') }}</button>
          <button @click="deleteProduct" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-all shadow-sm">
            {{ deleting ? $t('common.deleting') : $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()

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
const viewMode = ref<'grid' | 'list'>('grid')

const showPanel = ref(false)
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

onMounted(async () => {
  await fetchCategories()
  await fetchProducts()
  
  // Handle edit query param (from low stock alert click)
  const editId = route.query.edit as string
  if (editId) {
    const product = products.value.find(p => p._id === editId)
    if (product) {
      openEditModal(product)
    } else {
      // Product might not be in current page, fetch individually
      try {
        const data: any = await api.get(`/products/${editId}`)
        if (data.product) {
          openEditModal(data.product)
        }
      } catch {}
    }
  }
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

// Watch for edit query param (from low stock alert click)
watch(() => route.query.edit, async (editId) => {
  if (editId && !showPanel.value) {
    const product = products.value.find(p => p._id === editId)
    if (product) {
      openEditModal(product)
    } else {
      try {
        const data: any = await api.get(`/products/${editId}`)
        if (data.product) openEditModal(data.product)
      } catch {}
    }
  }
})

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
  showPanel.value = true
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
  showPanel.value = true
}

function closePanel() {
  showPanel.value = false
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
    formData.append('featured', form.value.featured ? 'true' : 'false')

    if (selectedFile.value) {
      formData.append('images', selectedFile.value)
    } else if (form.value.imageUrl && !editingProduct.value) {
      formData.append('imageUrl', form.value.imageUrl)
    } else if (form.value.imageUrl && editingProduct.value) {
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

    closePanel()
    fetchProducts()
  } catch (err: any) {
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
