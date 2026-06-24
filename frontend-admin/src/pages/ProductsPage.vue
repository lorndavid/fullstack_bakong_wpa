<template>
  <div class="space-y-5 font-khmer">

    <!-- ── Header ── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200/50">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-surface-800 dark:text-white tracking-tight">{{ $t('products.title') }}</h2>
          <p class="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{{ $t('products.showingOf', { count: products.length, total: pagination.total }) }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <!-- View Toggle -->
        <div class="flex items-center bg-surface-100 dark:bg-surface-700/80 rounded-xl p-1 border border-surface-200 dark:border-surface-600/50 shadow-inner">
          <button @click="viewMode = 'grid'"
            class="p-2 rounded-lg transition-all duration-200"
            :class="viewMode === 'grid'
              ? 'bg-white dark:bg-surface-600 shadow-md text-amber-500 scale-[1.02]'
              : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
          </button>
          <button @click="viewMode = 'list'"
            class="p-2 rounded-lg transition-all duration-200"
            :class="viewMode === 'list'
              ? 'bg-white dark:bg-surface-600 shadow-md text-amber-500 scale-[1.02]'
              : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
          </button>
        </div>
        <button @click="openCreateModal"
          class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-200/60 hover:shadow-amber-300/70 hover:from-amber-400 hover:to-orange-400 active:scale-[0.97] transition-all duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          {{ $t('products.addProduct') }}
        </button>
      </div>
    </div>

    <!-- ── Search & Filter ── -->
    <div class="bg-white dark:bg-surface-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-surface-100 dark:border-surface-700/50">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="searchQuery" @input="debouncedSearch" type="text"
            :placeholder="$t('common.search') + '...'"
            class="w-full pl-10 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all placeholder:text-surface-400" />
        </div>
        <select v-model="categoryFilter" @change="fetchProducts"
          class="px-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all min-w-[160px]">
          <option value="">{{ $t('common.allCategories') }}</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
        </select>
      </div>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700/50 shadow-sm overflow-hidden">
      <div class="p-12 text-center">
        <div class="inline-block w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-sm text-surface-500">{{ $t('common.loadingProducts') }}</p>
      </div>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm p-8 text-center">
      <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p class="text-red-500 text-sm mb-4">{{ error }}</p>
      <button @click="fetchProducts" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
        {{ $t('common.retry') }}
      </button>
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="products.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700/50 shadow-sm p-16 text-center">
      <div class="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center mx-auto mb-5">
        <svg class="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-surface-700 dark:text-surface-200 mb-2">{{ $t('products.noProducts') }}</h3>
      <p class="text-sm text-surface-400 mb-6">{{ searchQuery ? $t('common.tryDifferentSearch') : $t('products.addFirstProduct') }}</p>
      <button @click="openCreateModal"
        class="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl shadow-md hover:opacity-90 transition-opacity">
        {{ $t('products.addProduct') }}
      </button>
    </div>

    <!-- ── List View (Table) ── -->
    <div v-else-if="viewMode === 'list'" class="bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700/50 shadow-sm overflow-hidden animate-fade-in">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-100 dark:border-surface-700 bg-gradient-to-r from-surface-50 to-surface-50/50 dark:from-surface-800/80 dark:to-surface-800/50">
              <th class="text-left px-5 py-3.5 text-xs font-bold text-surface-500 uppercase tracking-widest">{{ $t('products.product') }}</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold text-surface-500 uppercase tracking-widest">{{ $t('products.category') }}</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold text-surface-500 uppercase tracking-widest">{{ $t('products.price') }}</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold text-surface-500 uppercase tracking-widest">{{ $t('products.discount') }}</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold text-surface-500 uppercase tracking-widest">{{ $t('products.stock') }}</th>
              <th class="text-left px-5 py-3.5 text-xs font-bold text-surface-500 uppercase tracking-widest">{{ $t('products.sold') }}</th>
              <th class="text-right px-5 py-3.5 text-xs font-bold text-surface-500 uppercase tracking-widest">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-50 dark:divide-surface-700/50">
            <tr v-for="product in products" :key="product._id"
              class="hover:bg-amber-50/40 dark:hover:bg-surface-700/30 transition-all duration-150 group">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 bg-surface-100 dark:bg-surface-700 rounded-xl flex-shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-amber-200 dark:group-hover:ring-amber-700/50 transition-all">
                    <img v-if="product.images && product.images[0]" :src="product.images[0].secure_url" :alt="product.name" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-surface-800 dark:text-white">{{ product.name }}</p>
                    <p class="text-xs text-surface-400 mt-0.5">#{{ product._id.slice(-8) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <span class="px-2.5 py-1 bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 text-xs font-medium rounded-lg">{{ getCategoryName(product.category) }}</span>
              </td>
              <td class="px-5 py-3.5 text-sm font-bold text-surface-800 dark:text-white">${{ product.price.toFixed(2) }}</td>
              <td class="px-5 py-3.5">
                <span v-if="product.discount > 0" class="px-2.5 py-1 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-xs font-bold rounded-lg border border-red-100 dark:border-red-800/30">-{{ product.discount }}%</span>
                <span v-else class="text-xs text-surface-300">{{ $t('products.noDiscount') }}</span>
              </td>
              <td class="px-5 py-3.5">
                <span class="text-sm font-semibold" :class="product.stock <= 10 ? 'text-red-500' : 'text-emerald-500'">{{ product.stock }}</span>
              </td>
              <td class="px-5 py-3.5 text-sm text-surface-600 dark:text-surface-300 font-medium">{{ product.sold }}</td>
              <td class="px-5 py-3.5 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button @click="openEditModal(product)"
                    class="p-2 text-surface-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all duration-150"
                    :title="$t('common.edit')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button @click="confirmDelete(product)"
                    class="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-150"
                    :title="$t('common.delete')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div class="flex items-center justify-between px-5 py-3.5 border-t border-surface-100 dark:border-surface-700/50 bg-surface-50/50 dark:bg-surface-800/50">
        <p class="text-xs text-surface-400">
          {{ $t('products.showingOf', { count: products.length, total: pagination.total }) }}
        </p>
        <div class="flex items-center gap-1.5">
          <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1"
            class="px-3 py-1.5 text-xs font-medium border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-white dark:hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            {{ $t('common.previous') }}
          </button>
          <button v-for="p in pagination.pages" :key="p" @click="goToPage(p)"
            class="w-8 h-8 text-xs font-semibold rounded-lg transition-all"
            :class="p === pagination.page
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
              : 'border border-surface-200 dark:border-surface-600 text-surface-500 hover:bg-white dark:hover:bg-surface-700'">
            {{ p }}
          </button>
          <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page >= pagination.pages"
            class="px-3 py-1.5 text-xs font-medium border border-surface-200 dark:border-surface-600 rounded-lg text-surface-500 hover:bg-white dark:hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            {{ $t('common.next') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Grid View (Cards) ── -->
    <div v-else class="animate-fade-in">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="product in products" :key="product._id"
          class="bg-white dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700/50 shadow-sm hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-amber-900/10 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
          <!-- Image -->
          <div class="aspect-square bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-700 dark:to-surface-800 overflow-hidden relative">
            <img v-if="product.images && product.images[0]"
              :src="product.images[0].secure_url" :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-14 h-14 text-surface-200 dark:text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <!-- Badges -->
            <div class="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
              <span v-if="product.discount > 0"
                class="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-lg shadow-md">
                -{{ product.discount }}%
              </span>
            </div>
            <div class="absolute top-2.5 right-2.5">
              <span v-if="product.stock <= 5"
                class="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md">
                {{ $t('products.lowStock') }}
              </span>
            </div>
            <!-- Hover Actions Overlay -->
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
              <div class="flex gap-2">
                <button @click="openEditModal(product)"
                  class="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-amber-600 text-xs font-bold rounded-lg shadow-lg hover:bg-amber-500 hover:text-white transition-all">
                  {{ $t('common.edit') }}
                </button>
                <button @click="confirmDelete(product)"
                  class="p-1.5 bg-white/95 backdrop-blur-sm text-red-500 rounded-lg shadow-lg hover:bg-red-500 hover:text-white transition-all">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <!-- Content -->
          <div class="p-4">
            <p class="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">{{ getCategoryName(product.category) }}</p>
            <h3 class="text-sm font-bold text-surface-800 dark:text-white line-clamp-1 mb-2">{{ product.name }}</h3>
            <div class="flex items-center justify-between">
              <div class="flex items-baseline gap-1.5">
                <span v-if="product.discount > 0" class="text-xs text-surface-300 dark:text-surface-500 line-through">${{ product.price.toFixed(2) }}</span>
                <span class="text-base font-extrabold text-surface-800 dark:text-white">${{ ((product.price * (100 - product.discount)) / 100).toFixed(2) }}</span>
              </div>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-lg"
                :class="product.stock <= 10
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'">
                {{ product.stock }} {{ $t('products.inStock') }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="flex items-center justify-center gap-2 mt-6">
        <button @click="goToPage(pagination.page - 1)" :disabled="pagination.page <= 1"
          class="px-4 py-2 text-sm font-medium border border-surface-200 dark:border-surface-600 rounded-xl text-surface-500 hover:bg-white dark:hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          {{ $t('common.previous') }}
        </button>
        <button v-for="p in pagination.pages" :key="p" @click="goToPage(p)"
          class="w-9 h-9 text-sm font-bold rounded-xl transition-all"
          :class="p === pagination.page
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200/50'
            : 'border border-surface-200 dark:border-surface-600 text-surface-500 hover:bg-white dark:hover:bg-surface-700'">
          {{ p }}
        </button>
        <button @click="goToPage(pagination.page + 1)" :disabled="pagination.page >= pagination.pages"
          class="px-4 py-2 text-sm font-medium border border-surface-200 dark:border-surface-600 rounded-xl text-surface-500 hover:bg-white dark:hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          {{ $t('common.next') }}
        </button>
      </div>
    </div>

    <!-- ── Create / Edit Modal ── -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
        <div class="relative bg-white dark:bg-surface-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-scale-in border border-surface-100 dark:border-surface-700/50">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-white/90 dark:bg-surface-800/90 backdrop-blur-md border-b border-surface-100 dark:border-surface-700/50 px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" v-if="!editingProduct"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" v-else/>
                </svg>
              </div>
              <h3 class="text-base font-bold text-surface-800 dark:text-white">
                {{ editingProduct ? $t('products.editProduct') : $t('products.addProduct') }}
              </h3>
            </div>
            <button @click="closeModal" class="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <!-- Form -->
          <form @submit.prevent="saveProduct" class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wider mb-1.5">{{ $t('products.productName') }}</label>
              <input v-model="form.name" required class="input-admin" />
            </div>
            <div>
              <label class="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wider mb-1.5">{{ $t('products.description') }}</label>
              <textarea v-model="form.description" required rows="3" class="input-admin resize-none"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wider mb-1.5">{{ $t('products.priceLabel') }}</label>
                <input v-model.number="form.price" type="number" step="0.01" min="0.01" required class="input-admin" />
              </div>
              <div>
                <label class="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wider mb-1.5">{{ $t('products.discountLabel') }}</label>
                <input v-model.number="form.discount" type="number" min="0" max="100" class="input-admin" />
              </div>
              <div>
                <label class="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wider mb-1.5">{{ $t('products.stockLabel') }}</label>
                <input v-model.number="form.stock" type="number" min="0" required class="input-admin" />
              </div>
              <div>
                <label class="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wider mb-1.5">{{ $t('products.categoryLabel') }}</label>
                <select v-model="form.category" required class="input-admin">
                  <option value="">{{ $t('products.selectCategory') }}</option>
                  <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
                </select>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/20">
              <input v-model="form.featured" type="checkbox" id="featured" class="w-4 h-4 text-amber-500 rounded focus:ring-amber-400" />
              <label for="featured" class="text-sm font-semibold text-surface-700 dark:text-surface-200 cursor-pointer">{{ $t('products.featuredProduct') }}</label>
            </div>
            <div>
              <label class="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                {{ $t('products.imageUrl') }} <span class="text-surface-400 font-normal normal-case">{{ $t('products.imageUrlFallback') }}</span>
              </label>
              <input v-model="form.imageUrl" type="url" placeholder="https://example.com/product.jpg" class="input-admin" />
              <p class="text-xs text-surface-400 mt-1">{{ $t('products.imageUrlHint') }}</p>
            </div>
            <div>
              <label class="block text-xs font-bold text-surface-600 dark:text-surface-300 uppercase tracking-wider mb-1.5">
                {{ $t('products.uploadImageFile') }} <span class="text-amber-500 font-normal normal-case">{{ $t('products.uploadRecommended') }}</span>
              </label>
              <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange"
                class="w-full text-sm text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gradient-to-r file:from-amber-500 file:to-orange-500 file:text-white hover:file:opacity-90 cursor-pointer" />
            </div>
            <div v-if="imagePreview || form.imageUrl" class="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-surface-200 dark:border-surface-600 shadow-sm">
              <img :src="imagePreview || form.imageUrl" class="w-full h-full object-cover" />
              <button v-if="imagePreview" type="button" @click="removeImage"
                class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-md">×</button>
              <button v-else type="button" @click="form.imageUrl = ''"
                class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-md">×</button>
            </div>
            <div v-if="Object.keys(fieldErrors).length > 0" class="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/30">
              <p class="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-2">{{ $t('common.error') }}:</p>
              <ul class="list-disc list-inside text-xs text-red-500 space-y-1">
                <li v-for="(msg, field) in fieldErrors" :key="field">
                  <span class="font-semibold capitalize">{{ field }}:</span> {{ msg }}
                </li>
              </ul>
            </div>
            <div v-else-if="submitError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-xl border border-red-100 dark:border-red-800/30">
              {{ submitError }}
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="closeModal" class="btn-admin-secondary flex-1 py-2.5">
                {{ $t('common.cancel') }}
              </button>
              <button type="submit" :disabled="saving" class="btn-admin-primary flex-1 py-2.5 disabled:opacity-50">
                <span v-if="saving" class="flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {{ $t('common.saving') }}
                </span>
                <span v-else>{{ editingProduct ? $t('products.updateProduct') : $t('products.createProduct') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ── Delete Confirmation ── -->
    <Teleport to="body">
      <div v-if="deletingProduct" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="deletingProduct = null"></div>
        <div class="relative bg-white dark:bg-surface-800 rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-scale-in text-center border border-surface-100 dark:border-surface-700/50">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-surface-800 dark:text-white mb-2">{{ $t('products.deleteTitle') }}</h3>
          <p class="text-sm text-surface-500 mb-6 leading-relaxed" v-html="$t('products.deleteDesc', { name: deletingProduct.name })"></p>
          <div v-if="deleteError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl mb-4 border border-red-100 dark:border-red-800/30">
            {{ deleteError }}
          </div>
          <div class="flex gap-3">
            <button @click="deletingProduct = null" class="btn-admin-secondary flex-1 py-2.5">{{ $t('common.cancel') }}</button>
            <button @click="deleteProduct" :disabled="deleting"
              class="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-semibold hover:from-red-400 hover:to-rose-400 disabled:opacity-50 shadow-lg shadow-red-200/50 transition-all active:scale-[0.98]">
              {{ deleting ? $t('common.deleting') : $t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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
const viewMode = ref<'grid' | 'list'>('grid')

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

    closeModal()
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
