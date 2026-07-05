<template>
  <div class="space-y-6">
    <!-- ─── Page Header ─────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-surface-800 dark:text-white tracking-tight">{{ $t('settings.title') }}</h1>
            <p class="text-sm text-surface-400 dark:text-surface-500">Configure your store's identity, appearance, and preferences</p>
          </div>
        </div>
      </div>
      <!-- Quick Save Indicator -->
      <div class="flex items-center gap-2 text-xs text-surface-400 dark:text-surface-500 bg-white dark:bg-surface-800 px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <span class="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
        All changes auto-saved
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="col-span-full bg-white dark:bg-surface-800 rounded-2xl shadow-card p-16 text-center">
      <div class="relative inline-flex">
        <div class="w-10 h-10 border-4 border-primary-100 dark:border-primary-900/30 rounded-full"></div>
        <div class="absolute top-0 left-0 w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p class="mt-4 text-sm text-surface-500">{{ $t('common.loadingSettings') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center border border-red-200 dark:border-red-900/30">
      <div class="w-14 h-14 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p class="text-red-500 text-sm mb-4 font-medium">{{ error }}</p>
      <button @click="fetchSettings" class="px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98]">
        <span class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Retry
        </span>
      </button>
    </div>

    <template v-else>
      <!-- ─── 3-Column Grid ──────────────────────────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- ════════ Column 1: Site Identity ════════ -->
        <div class="lg:col-span-1 space-y-6">
          <div class="group bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-surface-100 dark:border-surface-700/50 overflow-hidden">
            <!-- Card header with accent bar -->
            <div class="h-1.5 bg-gradient-to-r from-primary-500 to-primary-400"></div>
            <div class="p-5 sm:p-6 space-y-5">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 class="text-base font-bold text-surface-800 dark:text-white">{{ $t('settings.siteIdentity') }}</h3>
              </div>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-surface-600 dark:text-surface-300 uppercase tracking-wide mb-1.5">{{ $t('settings.siteName') }}</label>
                  <input v-model="form.siteName" 
                    class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all placeholder:text-surface-400" 
                    placeholder="My Store" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-surface-600 dark:text-surface-300 uppercase tracking-wide mb-1.5">{{ $t('settings.siteDescription') }}</label>
                  <input v-model="form.siteDescription" 
                    class="w-full px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all placeholder:text-surface-400" 
                    placeholder="Your store description" />
                </div>
              </div>

              <!-- Logo Upload -->
              <div class="border-t border-surface-100 dark:border-surface-700 pt-4 space-y-3">
                <div>
                  <label class="block text-xs font-semibold text-surface-600 dark:text-surface-300 uppercase tracking-wide mb-1.5">{{ $t('settings.siteLogo') }}</label>
                  <p class="text-xs text-surface-400 mb-3 leading-relaxed">{{ $t('settings.siteLogoDesc') }}</p>
                </div>
                <div class="flex items-start gap-4">
                  <!-- Logo Preview -->
                  <div class="relative w-20 h-20 bg-surface-50 dark:bg-surface-700 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-dashed border-surface-300 dark:border-surface-600 group-hover:border-primary-300 dark:group-hover:border-primary-600 transition-colors">
                    <img v-if="logoPreview || form.logoUrl" :src="logoPreview || form.logoUrl" alt="Logo preview" class="w-full h-full object-contain p-1" />
                    <svg v-else class="w-8 h-8 text-surface-300 dark:text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <!-- Hover overlay on preview -->
                    <div v-if="logoPreview || form.logoUrl" class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" @click="removeLogo" aria-label="Remove logo">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 space-y-2.5">
                    <input
                      ref="logoInput"
                      type="file"
                      accept="image/*"
                      @change="handleLogoChange"
                      class="w-full text-sm text-surface-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-600 dark:file:text-primary-400 hover:file:bg-primary-100 dark:hover:file:bg-primary-900/50 file:cursor-pointer cursor-pointer transition-all file:transition-all"
                    />
                    <div v-if="logoPreview || form.logoUrl" class="flex gap-3">
                      <button @click="removeLogo" type="button" class="text-xs font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1.5 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        {{ $t('settings.removeLogo') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ════════ Column 2: Theme Colors + Low Stock ════════ -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Theme Colors Card -->
          <div class="group bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-surface-100 dark:border-surface-700/50 overflow-hidden">
            <div class="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div class="p-5 sm:p-6 space-y-5">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-surface-800 dark:text-white">{{ $t('settings.themeColors') }}</h3>
                  <p class="text-xs text-surface-400 mt-0.5">{{ $t('settings.themeColorsDesc') }}</p>
                </div>
              </div>

              <div class="space-y-4">
                <div v-for="color in colorKeys" :key="color.key" class="p-3.5 bg-surface-50 dark:bg-surface-700/30 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors">
                  <div class="flex items-center justify-between mb-2.5">
                    <label class="text-xs font-semibold text-surface-700 dark:text-surface-200 capitalize">{{ $t(color.labelKey) }}</label>
                    <span class="text-[11px] font-mono text-surface-400 dark:text-surface-500 px-2 py-0.5 bg-white dark:bg-surface-800 rounded-md border border-surface-200 dark:border-surface-600">{{ form.colors[color.key] }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="relative">
                      <input
                        type="color"
                        v-model="form.colors[color.key]"
                        class="w-11 h-11 rounded-xl cursor-pointer border-2 border-surface-200 dark:border-surface-600 bg-transparent p-1"
                      />
                    </div>
                    <input
                      type="text"
                      v-model="form.colors[color.key]"
                      class="flex-1 px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
                    />
                  </div>
                  <!-- Live preview bar -->
                  <div class="mt-2.5 h-2 rounded-full transition-all duration-300" :style="{ background: form.colors[color.key] }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Low Stock Alert Card -->
          <div class="group bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-surface-100 dark:border-surface-700/50 overflow-hidden">
            <div class="h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div class="p-5 sm:p-6 space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-surface-800 dark:text-white">Low Stock Alert</h3>
                  <p class="text-xs text-surface-400 mt-0.5 leading-relaxed">Set the threshold for low stock warnings in the dashboard.</p>
                </div>
              </div>
              <div class="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-700/30 rounded-xl border border-surface-100 dark:border-surface-700/50">
                <div class="flex items-center gap-4">
                  <input v-model.number="form.lowStockThreshold" type="number" min="1" max="100"
                    class="w-20 h-12 px-3 py-2.5 border-2 border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-lg font-bold text-center focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all" />
                  <div>
                    <p class="text-sm font-semibold text-surface-800 dark:text-white">units</p>
                    <p class="text-xs text-surface-400">or fewer in stock</p>
                  </div>
                </div>
                <div class="hidden sm:flex items-center gap-1.5 text-xs text-surface-400 bg-white dark:bg-surface-800 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-600">
                  <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Alert trigger
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ════════ Column 3: Flash Sale ════════ -->
        <div class="lg:col-span-1 space-y-6">
          <div class="group bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-surface-100 dark:border-surface-700/50 overflow-hidden">
            <div class="h-1.5 bg-gradient-to-r from-accent-500 to-emerald-500"></div>
            <div class="p-5 sm:p-6 space-y-5">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-accent-50 dark:bg-accent-900/30 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-surface-800 dark:text-white">Flash Sale</h3>
                  <p class="text-xs text-surface-400 mt-0.5">Configure global flash sale end time & featured products.</p>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-surface-600 dark:text-surface-300 uppercase tracking-wide mb-1.5">End Time</label>
                <div class="relative">
                  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <input type="datetime-local" v-model="form.flashSale.endTime" 
                    class="w-full pl-10 pr-3 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-accent-500/30 focus:border-accent-400 transition-all" />
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-xs font-semibold text-surface-600 dark:text-surface-300 uppercase tracking-wide">Select Products</label>
                  <span class="text-[11px] text-surface-400 bg-surface-50 dark:bg-surface-700 px-2 py-0.5 rounded-md border border-surface-200 dark:border-surface-600">
                    {{ form.flashSale.products.length }} selected
                  </span>
                </div>
                <div v-if="allProducts.length === 0" class="text-sm text-surface-500 py-6 text-center bg-surface-50 dark:bg-surface-700/30 rounded-xl border border-dashed border-surface-300 dark:border-surface-600">
                  <svg class="w-6 h-6 mx-auto mb-2 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  Loading products...
                </div>
                <div v-else class="max-h-56 overflow-y-auto border border-surface-200 dark:border-surface-600 rounded-xl p-1.5 bg-surface-50 dark:bg-surface-700/30 space-y-0.5 scrollbar-thin">
                  <label v-for="product in allProducts" :key="product._id" 
                    :class="[
                      'flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border',
                      form.flashSale.products.includes(product._id)
                        ? 'bg-white dark:bg-surface-700 border-primary-200 dark:border-primary-700 shadow-sm'
                        : 'border-transparent hover:bg-white dark:hover:bg-surface-700 hover:border-surface-200 dark:hover:border-surface-600'
                    ]">
                    <input type="checkbox" :value="product._id" v-model="form.flashSale.products" 
                      class="w-4 h-4 text-primary-500 rounded border-surface-300 dark:border-surface-600 focus:ring-primary-500 bg-white dark:bg-surface-800" />
                    <img v-if="product.images?.length" :src="product.images[0].secure_url" class="w-9 h-9 rounded-lg object-cover border border-surface-200 dark:border-surface-700 flex-shrink-0" />
                    <div v-else class="w-9 h-9 rounded-lg bg-surface-200 dark:bg-surface-600 flex-shrink-0 flex items-center justify-center">
                      <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-semibold text-surface-800 dark:text-white truncate leading-tight">{{ product.name }}</p>
                      <p class="text-[11px] text-surface-400 truncate mt-0.5">${{ product.price.toFixed(2) }} <span v-if="product.discount" class="text-accent-500">({{ product.discount }}% off)</span></p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════ Full Width: Footer & Social Links ════════ -->
      <div class="group bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-surface-100 dark:border-surface-700/50 overflow-hidden">
        <div class="h-1.5 bg-gradient-to-r from-sky-500 to-cyan-500"></div>
        <div class="p-5 sm:p-6 space-y-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-sky-50 dark:bg-sky-900/30 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-surface-800 dark:text-white">Footer & Social Links</h3>
              <p class="text-xs text-surface-400 mt-0.5">These links appear in the storefront footer. Leave blank to hide an icon.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="field in socialFields" :key="field.key" class="p-3 bg-surface-50 dark:bg-surface-700/30 rounded-xl border border-surface-100 dark:border-surface-700/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors">
              <label class="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1.5 flex items-center gap-1.5">
                <span class="w-4 h-4 inline-flex items-center justify-center" v-html="field.icon"></span>
                {{ field.label }}
              </label>
              <input
                v-model="form.social[field.key]"
                :type="field.type || 'text'"
                :placeholder="field.placeholder"
                class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all placeholder:text-surface-400"
              />
            </div>
          </div>

          <div class="p-3.5 bg-surface-50 dark:bg-surface-700/30 rounded-xl border border-surface-100 dark:border-surface-700/50">
            <label class="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1.5 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Store Address
            </label>
            <input
              v-model="form.social.address"
              type="text"
              placeholder="e.g. Phnom Penh, Cambodia"
              class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all placeholder:text-surface-400"
            />
          </div>
        </div>
      </div>

      <!-- ════════ Full Width: Text Content Editor ════════ -->
      <div class="group bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-surface-100 dark:border-surface-700/50 overflow-hidden">
        <div class="h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
        <div class="p-5 sm:p-6 space-y-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-violet-50 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-surface-800 dark:text-white">{{ $t('settings.textContent') }}</h3>
              <p class="text-xs text-surface-400 mt-0.5">{{ $t('settings.textContentDesc') }}</p>
            </div>
          </div>

          <!-- Language Tabs -->
          <div class="flex gap-1.5 p-1 bg-surface-50 dark:bg-surface-700/50 rounded-xl w-fit">
            <button
              v-for="tab in textTabs"
              :key="tab.key"
              @click="activeTextTab = tab.key"
              class="px-4 py-2 text-xs font-semibold rounded-lg transition-all"
              :class="activeTextTab === tab.key
                ? 'bg-white dark:bg-surface-600 text-surface-800 dark:text-white shadow-sm border border-surface-200 dark:border-surface-500'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-white/50 dark:hover:bg-surface-600/50 border border-transparent'"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Text fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
            <div
              v-for="field in filteredTextFields"
              :key="field.key"
              class="p-3.5 bg-surface-50 dark:bg-surface-700/30 rounded-xl border border-surface-100 dark:border-surface-700/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
            >
              <label class="block text-[11px] font-semibold text-surface-500 uppercase tracking-wide mb-1.5">{{ field.label }}</label>
              <input
                :value="field.value"
                @input="updateTextField(field.key, ($event.target as HTMLInputElement).value)"
                class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
                :placeholder="field.defaultValue"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ════════ Sticky Action Bar ════════ -->
      <div class="sticky bottom-6 z-40">
        <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3)] border border-surface-200 dark:border-surface-700 p-4 flex items-center justify-between gap-4 backdrop-blur-xl bg-white/90 dark:bg-surface-800/90">
          <div class="flex items-center gap-3">
            <div class="hidden sm:flex items-center gap-1.5 text-xs text-surface-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Changes are saved locally
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button @click="resetForm" 
              class="px-5 py-2.5 border-2 border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 rounded-xl text-sm font-semibold hover:bg-surface-50 dark:hover:bg-surface-700 active:scale-[0.98] transition-all flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              {{ $t('settings.reset') }}
            </button>
            <button @click="saveSettings" :disabled="saving"
              class="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-bold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2.5">
              <svg v-if="saving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              {{ saving ? $t('settings.saving') : $t('settings.saveSettings') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Success Toast -->
      <Transition name="toast">
        <div v-if="successMessage" 
          class="fixed bottom-24 right-6 z-50 bg-accent-500 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-3 shadow-accent-500/25 animate-toast-slide">
          <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <span>{{ successMessage }}</span>
          <button @click="successMessage = null" aria-label="Dismiss" class="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </Transition>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'

interface Settings {
  _id: string
  colors: { primary: string; accent: string; surface: string }
  textOverrides: Record<string, string>
  logo?: { public_id: string; secure_url: string }
  siteName: string
  siteDescription: string
  lowStockThreshold: number
  flashSale?: { endTime: string; products: string[] }
  social?: Record<string, string>
}

interface Product {
  _id: string
  name: string
  price: number
  discount: number
  images: { secure_url: string }[]
}

const loading = ref(true)
const error = ref<string | null>(null)
const saving = ref(false)
const successMessage = ref<string | null>(null)
const activeTextTab = ref<'en' | 'km'>('en')

const form = reactive({
  siteName: '',
  siteDescription: '',
  lowStockThreshold: 5,
  colors: {
    primary: '#0055A4',
    accent: '#00C853',
    surface: '#F8FAFC',
  },
  textOverrides: {} as Record<string, string>,
  logoUrl: '',
  flashSale: {
    endTime: '',
    products: [] as string[]
  },
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    telegram: '',
    youtube: '',
    twitter: '',
    phone: '',
    email: '',
    address: '',
  } as Record<string, string>,
})

const socialFields: { key: string; label: string; placeholder: string; type?: string; icon: string }[] = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage', icon: '<svg viewBox="0 0 24 24" fill="#1877F2" class="w-4 h-4"><path d="M24 12a12 12 0 10-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.4 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0024 12z"/></svg>' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/youraccount', icon: '<svg viewBox="0 0 24 24" fill="#E4405F" class="w-4 h-4"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.5A6.3 6.3 0 1018.3 12 6.3 6.3 0 0012 5.7zm0 10.4A4.1 4.1 0 1116.1 12 4.1 4.1 0 0112 16.1zm6.5-10.6a1.5 1.5 0 11-1.5-1.5 1.5 1.5 0 011.5 1.5z"/></svg>' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@youraccount', icon: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M16.6 5.8a4.3 4.3 0 01-1-2.8h-3.3v13.2a2.4 2.4 0 11-2.4-2.4c.2 0 .5 0 .7.1V8.5a5.7 5.7 0 00-.7 0 5.7 5.7 0 105.7 5.7V8.6a7.5 7.5 0 004.4 1.4V6.7a4.3 4.3 0 01-3.4-.9z"/></svg>' },
  { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/youraccount', icon: '<svg viewBox="0 0 24 24" fill="#0088cc" class="w-4 h-4"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 6.9l-1.5 7.3c-.1.5-.4.6-.9.4l-2.5-1.8-1.2 1.1c-.1.1-.2.2-.5.2l.2-2.5 4.6-4.1c.2-.2 0-.3-.3-.1L9 13l-2.4-.8c-.5-.2-.5-.5.1-.8l9.5-3.6c.4-.2.8.1.7.6z"/></svg>' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel', icon: '<svg viewBox="0 0 24 24" fill="#FF0000" class="w-4 h-4"><path d="M23 7.5a3 3 0 00-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 001 7.5 31 31 0 001 12a31 31 0 00.1 4.5 3 3 0 002.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 002.1-2.1A31 31 0 0023 12a31 31 0 00-.1-4.5zM10 15V9l5 3z"/></svg>' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/youraccount', icon: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M18.2 2h3.3l-7.2 8.3L23 22h-6.6l-5.2-6.8L5.2 22H1.9l7.7-8.8L1 2h6.8l4.7 6.2zm-1.2 18h1.8L7.1 3.9H5.2z"/></svg>' },
  { key: 'phone', label: 'Phone', placeholder: '+855 12 345 678', type: 'tel', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M3 5a2 2 0 012-2h3.3a1 1 0 01.9.7l1.5 4.5a1 1 0 01-.5 1.2l-2.3 1.1a11 11 0 005.5 5.5l1.1-2.3a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.7.9V19a2 2 0 01-2 2h-1C9.7 21 3 14.3 3 6z"/></svg>' },
  { key: 'email', label: 'Email', placeholder: 'hello@myshop.com', type: 'email', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M3 8l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>' },
]

const allProducts = ref<Product[]>([])
const logoInput = ref<HTMLInputElement | null>(null)
const selectedLogo = ref<File | null>(null)
const logoPreview = ref<string | null>(null)

const colorKeys = [
  { key: 'primary' as const, label: 'Primary Color', labelKey: 'settings.primaryColor' },
  { key: 'accent' as const, label: 'Accent Color', labelKey: 'settings.accentColor' },
  { key: 'surface' as const, label: 'Background Color', labelKey: 'settings.backgroundColor' },
]

const textTabs = [
  { key: 'en' as const, label: '🇺🇸 English' },
  { key: 'km' as const, label: '🇰🇭 ភាសាខ្មែរ' },
]

// Define all editable text fields
const textFields = computed(() => [
  // Banner
  { key: 'banner.freeShipping', label: 'Banner - Free Shipping', defaultValue: 'Free Shipping on all orders — No minimum required!', lang: 'en' },
  { key: 'banner.freeShipping_km', label: 'បដា - ដឹកជញ្ជូនឥតគិតថ្លៃ', defaultValue: 'ដឹកជញ្ជូនឥតគិតថ្លៃ — មិនតម្រូវឱ្យមានការបញ្ជាទិញអប្បបរមា!', lang: 'km' },
  // Homepage
  { key: 'home.freeShipping', label: 'Home - Free Shipping Title', defaultValue: 'Free Shipping on Everything', lang: 'en' },
  { key: 'home.freeShipping_km', label: 'ទំព័រដើម - ដឹកជញ្ជូនឥតគិតថ្លៃ', defaultValue: 'ដឹកជញ្ជូនឥតគិតថ្លៃលើអ្វីៗទាំងអស់', lang: 'km' },
  { key: 'home.freeShippingDesc', label: 'Home - Free Shipping Desc', defaultValue: 'Every order ships free. No minimum required.', lang: 'en' },
  { key: 'home.freeShippingDesc_km', label: 'ទំព័រដើម - ពិពណ៌នា', defaultValue: 'រាល់ការបញ្ជាទិញសុទ្ធតែដឹកជញ្ជូនឥតគិតថ្លៃ', lang: 'km' },
  // Cart
  { key: 'cart.free', label: 'Cart - Free Shipping Label', defaultValue: 'FREE', lang: 'en' },
  { key: 'cart.free_km', label: 'កន្ត្រក - ឥតគិតថ្លៃ', defaultValue: 'ឥតគិតថ្លៃ', lang: 'km' },
  // Checkout
  { key: 'checkout.freeShipping', label: 'Checkout - Free Shipping Badge', defaultValue: 'Free Shipping 🎉', lang: 'en' },
  { key: 'checkout.freeShipping_km', label: 'ការទូទាត់ - ដឹកជញ្ជូនឥតគិតថ្លៃ', defaultValue: 'ដឹកជញ្ជូនឥតគិតថ្លៃ 🎉', lang: 'km' },
  // Footer
  { key: 'footer.allRightsReserved', label: 'Footer - All Rights Reserved', defaultValue: 'All rights reserved.', lang: 'en' },
  { key: 'footer.allRightsReserved_km', label: 'បាតកថា - រក្សាសិទ្ធិ', defaultValue: 'រក្សាសិទ្ធិគ្រប់យ៉ាង។', lang: 'km' },
])

const filteredTextFields = computed(() => {
  return textFields.value
    .filter(f => f.lang === activeTextTab.value)
    .map(f => ({
      ...f,
      value: form.textOverrides[f.key] !== undefined ? form.textOverrides[f.key] : f.defaultValue,
    }))
})

function updateTextField(key: string, value: string) {
  form.textOverrides[key] = value
}

let originalSettings: Settings | null = null

onMounted(async () => {
  await fetchProducts()
  fetchSettings()
})

async function fetchProducts() {
  try {
    const data: any = await api.get('/products?limit=100') // fetch up to 100 for admin selection
    allProducts.value = data.products || []
  } catch (err) {
    console.error('Failed to load products for flash sale', err)
  }
}

async function fetchSettings() {
  loading.value = true
  error.value = null
  try {
    const data: any = await api.get('/settings')
    const s = data.settings as Settings
    originalSettings = JSON.parse(JSON.stringify(s))
    form.siteName = s.siteName || 'MY SHOP'
    form.siteDescription = s.siteDescription || ''
    form.colors = {
      primary: s.colors?.primary || '#0055A4',
      accent: s.colors?.accent || '#00C853',
      surface: s.colors?.surface || '#F8FAFC',
    }
    form.textOverrides = { ...(s.textOverrides || {}) }
    form.logoUrl = s.logo?.secure_url || ''
    form.lowStockThreshold = s.lowStockThreshold || 5

    // Load social links
    const social = (s as any).social || {}
    form.social = {
      facebook: social.facebook || '',
      instagram: social.instagram || '',
      tiktok: social.tiktok || '',
      telegram: social.telegram || '',
      youtube: social.youtube || '',
      twitter: social.twitter || '',
      phone: social.phone || '',
      email: social.email || '',
      address: social.address || '',
    }
    
    // Parse flash sale
    if (s.flashSale) {
      form.flashSale.products = s.flashSale.products || []
      // Convert ISO date to local datetime for datetime-local input
      if (s.flashSale.endTime) {
        const d = new Date(s.flashSale.endTime)
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        form.flashSale.endTime = d.toISOString().slice(0, 16)
      }
    } else {
      form.flashSale = { endTime: '', products: [] }
    }
    
    logoPreview.value = null
    selectedLogo.value = null
  } catch (err: any) {
    error.value = err.message || 'Failed to load settings'
  } finally {
    loading.value = false
  }
}

function handleLogoChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedLogo.value = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  }
}

function removeLogo() {
  selectedLogo.value = null
  logoPreview.value = null
  form.logoUrl = ''
  if (logoInput.value) logoInput.value.value = ''
}

function resetForm() {
  if (originalSettings) {
    form.siteName = originalSettings.siteName || 'MY SHOP'
    form.siteDescription = originalSettings.siteDescription || ''
    form.colors = { ...originalSettings.colors }
    form.textOverrides = { ...originalSettings.textOverrides }
    form.logoUrl = originalSettings.logo?.secure_url || ''
    
    if (originalSettings.flashSale) {
      form.flashSale.products = [...originalSettings.flashSale.products]
      if (originalSettings.flashSale.endTime) {
        const d = new Date(originalSettings.flashSale.endTime)
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        form.flashSale.endTime = d.toISOString().slice(0, 16)
      } else {
        form.flashSale.endTime = ''
      }
    } else {
      form.flashSale = { endTime: '', products: [] }
    }

    form.lowStockThreshold = originalSettings.lowStockThreshold || 5;

    const social = (originalSettings as any).social || {}
    form.social = {
      facebook: social.facebook || '',
      instagram: social.instagram || '',
      tiktok: social.tiktok || '',
      telegram: social.telegram || '',
      youtube: social.youtube || '',
      twitter: social.twitter || '',
      phone: social.phone || '',
      email: social.email || '',
      address: social.address || '',
    }

    logoPreview.value = null
    selectedLogo.value = null
  }
}

async function saveSettings() {
  saving.value = true
  error.value = null
  successMessage.value = null
  try {
    const formData = new FormData()
    formData.append('siteName', form.siteName)
    formData.append('siteDescription', form.siteDescription)
    formData.append('lowStockThreshold', String(form.lowStockThreshold))
    formData.append('colors', JSON.stringify(form.colors))
    
    // Add Flash sale
    const flashSaleData = {
      endTime: form.flashSale.endTime ? new Date(form.flashSale.endTime).toISOString() : null,
      products: form.flashSale.products
    }
    formData.append('flashSale', JSON.stringify(flashSaleData))

    // Add social links
    formData.append('social', JSON.stringify(form.social))

    // Only send text overrides that differ from defaults
    const changedOverrides: Record<string, string> = {}
    for (const field of textFields.value) {
      const val = form.textOverrides[field.key]
      if (val !== undefined && val !== field.defaultValue) {
        changedOverrides[field.key] = val
      }
    }
    formData.append('textOverrides', JSON.stringify(changedOverrides))

    // Handle logo
    if (selectedLogo.value) {
      formData.append('logo', selectedLogo.value)
    } else if (!form.logoUrl && originalSettings?.logo) {
      // Logo was removed
      formData.append('removeLogo', 'true')
    }

    const data: any = await api.put('/settings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    originalSettings = JSON.parse(JSON.stringify(data.settings))
    form.textOverrides = { ...(data.settings.textOverrides || {}) }
    form.logoUrl = data.settings.logo?.secure_url || ''
    selectedLogo.value = null
    logoPreview.value = null

    successMessage.value = 'Settings saved successfully!'
    setTimeout(() => { successMessage.value = null }, 3000)
  } catch (err: any) {
    error.value = err.message || 'Failed to save settings'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Card hover lift effect */
.group {
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}
.group:hover {
  transform: translateY(-2px);
}

/* Custom scrollbar for product list & text editor */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #D5DBE5 transparent;
}
.dark .scrollbar-thin {
  scrollbar-color: #2E3950 transparent;
}
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #D5DBE5;
  border-radius: 99px;
}
.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: #2E3950;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #A9B4C8;
}
.dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #43506C;
}

/* Toast transition */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.animate-toast-slide {
  animation: toastSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes toastSlide {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Color input style */
input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 2px;
}
input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 8px;
}

/* Number input arrows hidden */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
}

/* Focus ring offset fix */
*:focus-visible {
  outline: none;
}
</style>
