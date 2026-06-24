<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('promotions.title') }}</h2>
      </div>
      <button @click="openCreateModal" class="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-lg hover:bg-rose-600 transition-all flex items-center gap-2 shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        {{ $t('promotions.addPromotion') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-2 text-sm text-surface-500">{{ $t('common.loading') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <p class="text-red-500 text-sm mb-3">{{ error }}</p>
      <button @click="fetchPromotions" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="promotions.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">{{ $t('promotions.noPromotions') }}</h3>
      <p class="text-sm text-surface-500 mb-4">{{ $t('promotions.noPromotionsDesc') }}</p>
      <button @click="openCreateModal" class="px-4 py-2 bg-rose-500 text-white text-sm rounded-lg">{{ $t('promotions.addPromotion') }}</button>
    </div>

    <!-- Promotions Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="promo in promotions"
        :key="promo._id"
        class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden group border border-surface-100 dark:border-surface-700 hover:shadow-card-hover transition-all duration-200"
      >
        <!-- Banner Image -->
        <div v-if="promo.bannerImage" class="relative aspect-video bg-surface-100 dark:bg-surface-700 overflow-hidden">
          <img :src="promo.bannerImage.secure_url" :alt="promo.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div class="absolute top-2 right-2 flex gap-1.5">
            <span class="px-2 py-0.5 text-xs font-semibold rounded-full backdrop-blur-sm"
              :class="promo.isActive ? 'bg-green-500 text-white' : 'bg-surface-500 text-white'">
              {{ promo.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
        <div v-else class="relative aspect-video bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-800/20 flex items-center justify-center">
          <svg class="w-12 h-12 text-rose-300 dark:text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </div>

        <div class="p-4 space-y-2">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-surface-800 dark:text-white truncate flex-1">{{ promo.name }}</h3>
            <span class="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-full whitespace-nowrap">-{{ promo.discountPercent }}%</span>
          </div>

          <p v-if="promo.description" class="text-xs text-surface-500 line-clamp-2">{{ promo.description }}</p>

          <!-- Date Range -->
          <div class="flex items-center gap-2 text-xs text-surface-400">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span>{{ formatDate(promo.startDate) }} — {{ formatDate(promo.endDate) }}</span>
          </div>

          <!-- Selection Info -->
          <div class="flex flex-wrap gap-1.5 pt-1">
            <span v-if="promo.applyToAll" class="px-2 py-0.5 bg-surface-100 dark:bg-surface-700 text-surface-500 text-[11px] rounded-full">All Products</span>
            <span v-if="promo.selectedCategories?.length > 0" class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] rounded-full">{{ promo.selectedCategories.length }} Category(ies)</span>
            <span v-if="promo.selectedProducts?.length > 0 && !promo.applyToAll" class="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[11px] rounded-full">{{ promo.selectedProducts.length }} Product(s)</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-surface-100 dark:border-surface-700">
            <button @click="toggleActive(promo)" class="text-xs font-medium transition-colors"
              :class="promo.isActive ? 'text-yellow-500 hover:text-yellow-600' : 'text-surface-400 hover:text-green-500'">
              {{ promo.isActive ? 'Deactivate' : 'Activate' }}
            </button>
            <div class="flex gap-1.5">
              <button @click="openEditModal(promo)" class="p-1.5 text-surface-400 hover:text-primary-500 transition-colors" :title="$t('common.edit')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button @click="confirmDelete(promo)" class="p-1.5 text-surface-400 hover:text-red-500 transition-colors" :title="$t('common.delete')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Slide-in Panel (Create/Edit) -->
    <div v-if="showPanel" class="fixed inset-0 z-50" @click.self="closePanel">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="closePanel"></div>
      <div class="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-surface-800 shadow-2xl animate-slide-in-right flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-surface-800 dark:text-white">{{ editingPromotion ? $t('promotions.editPromotion') : $t('promotions.addPromotion') }}</h3>
              <p class="text-xs text-surface-400">{{ editingPromotion ? 'Update promotion details' : 'Create a new promotion event' }}</p>
            </div>
          </div>
          <button @click="closePanel" class="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Form Body (scrollable) -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <form @submit.prevent="savePromotion" class="space-y-5">
            <!-- Name & Discount -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('promotions.name') }} *</label>
                <input v-model="form.name" required maxlength="100"
                  class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-rose-500/50 transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('promotions.discountPercent') }} *</label>
                <div class="relative">
                  <input v-model.number="form.discountPercent" type="number" min="0" max="100" required
                    class="w-full px-3.5 py-2.5 pr-8 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-rose-500/50 transition-all" />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">%</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('promotions.description') }}</label>
              <textarea v-model="form.description" rows="2" maxlength="500"
                class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-rose-500/50 resize-none transition-all"></textarea>
            </div>

            <!-- Date Range -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('promotions.startDate') }} *</label>
                <input v-model="form.startDate" type="datetime-local" required
                  class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-rose-500/50 transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('promotions.endDate') }} *</label>
                <input v-model="form.endDate" type="datetime-local" required
                  class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-rose-500/50 transition-all" />
              </div>
            </div>

            <!-- Banner Image -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('promotions.bannerImage') }}</label>
              <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange"
                class="w-full text-sm text-surface-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-rose-50 dark:file:bg-rose-900/30 file:text-rose-600 dark:file:text-rose-400 hover:file:bg-rose-100 transition-all" />
              <div v-if="imagePreview || (editingPromotion && editingPromotion.bannerImage)" class="mt-2 relative w-full aspect-video rounded-xl overflow-hidden border-2 border-surface-200 dark:border-surface-600">
                <img :src="imagePreview || editingPromotion?.bannerImage?.secure_url" class="w-full h-full object-cover" />
                <button v-if="imagePreview" type="button" @click="removeImage" class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-sm transition-all">×</button>
              </div>
            </div>

            <!-- Selection Mode -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-3">{{ $t('promotions.applyTo') }}</label>
              <div class="flex flex-wrap gap-3 mb-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.applyToAll" :value="true" class="w-4 h-4 text-rose-500 focus:ring-rose-500" />
                  <span class="text-sm text-surface-700 dark:text-surface-200">{{ $t('promotions.allProducts') }}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.applyToAll" :value="false" class="w-4 h-4 text-rose-500 focus:ring-rose-500" />
                  <span class="text-sm text-surface-700 dark:text-surface-200">{{ $t('promotions.selectProducts') }}</span>
                </label>
              </div>

              <div v-if="!form.applyToAll" class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('promotions.byCategory') }}</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="cat in categories"
                      :key="cat._id"
                      type="button"
                      @click="toggleCategory(cat._id)"
                      class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150"
                      :class="form.selectedCategories.includes(cat._id)
                        ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400'
                        : 'border-surface-200 dark:border-surface-600 text-surface-500 hover:border-surface-300'"
                    >
                      {{ cat.icon }} {{ cat.name }}
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('promotions.byProduct') }}</label>
                  <div class="relative mb-2">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <input v-model="productSearch" type="text" :placeholder="$t('promotions.searchProducts')"
                      class="w-full pl-10 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-rose-500/50 transition-all" />
                  </div>
                  <div class="max-h-40 overflow-y-auto space-y-1 border border-surface-100 dark:border-surface-700 rounded-lg p-1.5">
                    <div v-if="filteredProducts.length === 0" class="text-center py-4 text-xs text-surface-400">{{ $t('promotions.noProducts') }}</div>
                    <label
                      v-for="product in filteredProducts"
                      :key="product._id"
                      class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50 cursor-pointer transition-colors"
                    >
                      <input type="checkbox" :value="product._id" v-model="form.selectedProducts"
                        class="w-4 h-4 text-rose-500 rounded focus:ring-rose-500" />
                      <div class="w-8 h-8 bg-surface-100 dark:bg-surface-700 rounded flex-shrink-0 overflow-hidden">
                        <img v-if="product.images?.[0]" :src="product.images[0].secure_url" :alt="product.name" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                          <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                      </div>
                      <span class="text-sm text-surface-700 dark:text-surface-200 truncate flex-1">{{ product.name }}</span>
                      <span class="text-xs text-surface-400">${{ product.price.toFixed(2) }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Active Toggle -->
            <div class="flex items-center gap-2.5 p-3 bg-surface-50 dark:bg-surface-700/30 rounded-lg">
              <input v-model="form.isActive" type="checkbox" id="promo-active" class="w-4 h-4 text-rose-500 rounded focus:ring-rose-500" />
              <label for="promo-active" class="text-sm font-medium text-surface-700 dark:text-surface-200 cursor-pointer">{{ $t('promotions.active') }}</label>
            </div>

            <!-- Validation Errors -->
            <div v-if="submitError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3.5 rounded-xl">{{ submitError }}</div>
          </form>
        </div>

        <!-- Footer -->
        <div class="flex items-center gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 flex-shrink-0">
          <button type="button" @click="closePanel" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-surface-700 transition-all">{{ $t('common.cancel') }}</button>
          <button type="submit" @click="savePromotion" :disabled="saving" class="flex-1 py-2.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 disabled:opacity-50 transition-all shadow-sm">
            <span v-if="saving" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ $t('common.saving') }}
            </span>
            <span v-else>{{ editingPromotion ? $t('promotions.updatePromotion') : $t('promotions.createPromotion') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation (slide-in) -->
    <div v-if="deletingPromotion" class="fixed inset-0 z-50">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="deletingPromotion = null"></div>
      <div class="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-surface-800 shadow-2xl animate-slide-in-right flex flex-col">
        <div class="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
          </div>
          <h3 class="text-xl font-bold text-surface-800 dark:text-white mb-2">{{ $t('promotions.deleteTitle') }}</h3>
          <p class="text-sm text-surface-500 mb-8" v-html="$t('promotions.deleteDesc', { name: deletingPromotion.name })"></p>
          <div v-if="deleteError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3.5 rounded-xl mb-4 w-full">{{ deleteError }}</div>
        </div>
        <div class="flex items-center gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
          <button @click="deletingPromotion = null" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-surface-700 transition-all">{{ $t('common.cancel') }}</button>
          <button @click="deletePromotion" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-all shadow-sm">
            {{ deleting ? $t('common.deleting') : $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

interface Category {
  _id: string
  name: string
  icon: string
}

interface Product {
  _id: string
  name: string
  price: number
  images: { public_id: string; secure_url: string }[]
}

interface Promotion {
  _id: string
  name: string
  description: string
  discountPercent: number
  selectedProducts: Product[]
  selectedCategories: Category[]
  applyToAll: boolean
  startDate: string
  endDate: string
  isActive: boolean
  bannerImage?: { public_id: string; secure_url: string }
  createdAt: string
}

const promotions = ref<Promotion[]>([])
const categories = ref<Category[]>([])
const allProducts = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const showPanel = ref(false)
const editingPromotion = ref<Promotion | null>(null)
const saving = ref(false)
const submitError = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const productSearch = ref('')

const form = ref({
  name: '',
  description: '',
  discountPercent: 10,
  selectedProducts: [] as string[],
  selectedCategories: [] as string[],
  applyToAll: false,
  startDate: '',
  endDate: '',
  isActive: true,
})

const filteredProducts = computed(() => {
  if (!productSearch.value) return allProducts.value
  const q = productSearch.value.toLowerCase()
  return allProducts.value.filter(p => p.name.toLowerCase().includes(q))
})

const deletingPromotion = ref<Promotion | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

onMounted(() => {
  Promise.all([fetchPromotions(), fetchCategories(), fetchProducts()])
})

async function fetchPromotions() {
  loading.value = true
  error.value = null
  try {
    const data: any = await api.get('/promotions')
    promotions.value = data.promotions || []
  } catch (err: any) {
    error.value = err.message || 'Failed to load promotions'
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const data: any = await api.get('/categories')
    categories.value = data.categories || []
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  }
}

async function fetchProducts() {
  try {
    const data: any = await api.get('/promotions/products')
    allProducts.value = data.products || []
  } catch (err) {
    console.error('Failed to fetch products:', err)
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

function toggleCategory(catId: string) {
  const idx = form.value.selectedCategories.indexOf(catId)
  if (idx === -1) {
    form.value.selectedCategories.push(catId)
  } else {
    form.value.selectedCategories.splice(idx, 1)
  }
}

function openCreateModal() {
  editingPromotion.value = null
  form.value = {
    name: '',
    description: '',
    discountPercent: 10,
    selectedProducts: [],
    selectedCategories: [],
    applyToAll: false,
    startDate: '',
    endDate: '',
    isActive: true,
  }
  selectedFile.value = null
  imagePreview.value = null
  submitError.value = null
  productSearch.value = ''
  if (fileInput.value) fileInput.value.value = ''
  showPanel.value = true
}

function openEditModal(promo: Promotion) {
  editingPromotion.value = promo
  form.value = {
    name: promo.name,
    description: promo.description || '',
    discountPercent: promo.discountPercent,
    selectedProducts: promo.selectedProducts?.map(p => p._id) || [],
    selectedCategories: promo.selectedCategories?.map(c => c._id) || [],
    applyToAll: promo.applyToAll,
    startDate: toDatetimeLocal(promo.startDate),
    endDate: toDatetimeLocal(promo.endDate),
    isActive: promo.isActive,
  }
  selectedFile.value = null
  imagePreview.value = null
  submitError.value = null
  productSearch.value = ''
  if (fileInput.value) fileInput.value.value = ''
  showPanel.value = true
}

function closePanel() {
  showPanel.value = false
  editingPromotion.value = null
  submitError.value = null
}

function toDatetimeLocal(dateStr: string): string {
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function savePromotion() {
  if (form.value.startDate >= form.value.endDate) {
    submitError.value = 'End date must be after start date'
    return
  }

  if (!form.value.applyToAll && form.value.selectedProducts.length === 0 && form.value.selectedCategories.length === 0) {
    submitError.value = 'Please select products, categories, or enable "All Products"'
    return
  }

  saving.value = true
  submitError.value = null
  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('description', form.value.description)
    formData.append('discountPercent', String(form.value.discountPercent))
    formData.append('selectedProducts', JSON.stringify(form.value.selectedProducts))
    formData.append('selectedCategories', JSON.stringify(form.value.selectedCategories))
    formData.append('applyToAll', String(form.value.applyToAll))
    formData.append('startDate', form.value.startDate)
    formData.append('endDate', form.value.endDate)
    formData.append('isActive', String(form.value.isActive))

    if (selectedFile.value) {
      formData.append('bannerImage', selectedFile.value)
    }

    if (editingPromotion.value) {
      await api.put(`/promotions/${editingPromotion.value._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      await api.post('/promotions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    closePanel()
    fetchPromotions()
  } catch (err: any) {
    submitError.value = err.message || 'Failed to save promotion'
  } finally {
    saving.value = false
  }
}

function confirmDelete(promo: Promotion) {
  deletingPromotion.value = promo
  deleteError.value = null
}

async function deletePromotion() {
  if (!deletingPromotion.value) return
  deleting.value = true
  deleteError.value = null
  try {
    await api.delete(`/promotions/${deletingPromotion.value._id}`)
    deletingPromotion.value = null
    fetchPromotions()
  } catch (err: any) {
    deleteError.value = err.message || 'Failed to delete promotion'
  } finally {
    deleting.value = false
  }
}

async function toggleActive(promo: Promotion) {
  try {
    await api.put(`/promotions/${promo._id}`, { isActive: !promo.isActive })
    fetchPromotions()
  } catch (err) {
    console.error('Failed to toggle promotion status:', err)
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
