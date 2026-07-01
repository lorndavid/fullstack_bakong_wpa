<template>
  <div class="space-y-6">      <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('settings.title') }}</h2>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-3 text-sm text-surface-500">{{ $t('common.loadingSettings') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center">
      <p class="text-red-500 text-sm mb-3">{{ error }}</p>
      <button @click="fetchSettings" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">Retry</button>
    </div>

    <template v-else>
      <!-- Site Identity -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
        <h3 class="text-lg font-bold text-surface-800 dark:text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ $t('settings.siteIdentity') }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">{{ $t('settings.siteName') }}</label>
            <input v-model="form.siteName" class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">{{ $t('settings.siteDescription') }}</label>
            <input v-model="form.siteDescription" class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50" />
          </div>
        </div>

        <!-- Logo Upload -->
        <div class="border-t border-surface-200 dark:border-surface-700 pt-4">
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">{{ $t('settings.siteLogo') }}</label>
          <p class="text-xs text-surface-400 mb-3">{{ $t('settings.siteLogoDesc') }}</p>
          <div class="flex items-start gap-4">
            <!-- Logo Preview -->
            <div class="w-20 h-20 bg-surface-100 dark:bg-surface-700 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-dashed border-surface-300 dark:border-surface-600">
              <img v-if="logoPreview || form.logoUrl" :src="logoPreview || form.logoUrl" alt="Logo preview" class="w-full h-full object-contain" />
              <svg v-else class="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="flex-1 space-y-2">
              <input
                ref="logoInput"
                type="file"
                accept="image/*"
                @change="handleLogoChange"
                class="w-full text-sm text-surface-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-600 dark:file:text-primary-400 hover:file:bg-primary-100"
              />
              <div v-if="logoPreview || form.logoUrl" class="flex gap-2">
                <button @click="removeLogo" type="button" class="text-xs text-red-500 hover:text-red-600 font-medium">{{ $t('settings.removeLogo') }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
        <h3 class="text-lg font-bold text-surface-800 dark:text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Low Stock Alert
        </h3>
        <p class="text-sm text-surface-500">Set the stock threshold for low stock alerts. Products with stock at or below this number will trigger a notification in the top bar.</p>
        <div class="max-w-xs">
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Threshold (units)</label>
          <div class="flex items-center gap-3">
            <input v-model.number="form.lowStockThreshold" type="number" min="1" max="100"
              class="w-24 px-3.5 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm font-semibold text-center focus:ring-2 focus:ring-primary-500/50 transition-all" />
            <span class="text-sm text-surface-400">or fewer units</span>
          </div>
        </div>
      </div>

      <!-- Flash Sale -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
        <h3 class="text-lg font-bold text-surface-800 dark:text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Flash Sale Settings
        </h3>
        <p class="text-sm text-surface-500">Configure the global flash sale end time and select which products are featured.</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">End Time</label>
            <input type="datetime-local" v-model="form.flashSale.endTime" class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Select Products</label>
          <div v-if="allProducts.length === 0" class="text-sm text-surface-500 py-2">Loading products...</div>
          <div v-else class="max-h-60 overflow-y-auto border border-surface-200 dark:border-surface-600 rounded-lg p-2 bg-surface-50 dark:bg-surface-700/50 space-y-1">
            <label v-for="product in allProducts" :key="product._id" class="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-surface-800 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-surface-200 dark:hover:border-surface-600">
              <input type="checkbox" :value="product._id" v-model="form.flashSale.products" class="w-4 h-4 text-primary-500 rounded border-surface-300 dark:border-surface-600 focus:ring-primary-500 bg-white dark:bg-surface-800" />
              <img v-if="product.images?.length" :src="product.images[0].secure_url" class="w-10 h-10 rounded object-cover border border-surface-200 dark:border-surface-700" />
              <div v-else class="w-10 h-10 rounded bg-surface-200 dark:bg-surface-600"></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-surface-800 dark:text-white truncate">{{ product.name }}</p>
                <p class="text-xs text-surface-500 truncate">${{ product.price.toFixed(2) }} (Discount: {{ product.discount }}%)</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Footer & Social Links -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
        <h3 class="text-lg font-bold text-surface-800 dark:text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
          </svg>
          Footer & Social Links
        </h3>
        <p class="text-sm text-surface-500">These links appear in the storefront footer. Leave blank to hide an icon.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="field in socialFields" :key="field.key">
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1 flex items-center gap-1.5">
              <span class="w-4 h-4 inline-flex items-center justify-center" v-html="field.icon"></span>
              {{ field.label }}
            </label>
            <input
              v-model="form.social[field.key]"
              :type="field.type || 'text'"
              :placeholder="field.placeholder"
              class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">Store Address</label>
          <input
            v-model="form.social.address"
            type="text"
            placeholder="e.g. Phnom Penh, Cambodia"
            class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50"
          />
        </div>
      </div>

      <!-- Theme Colors -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
        <h3 class="text-lg font-bold text-surface-800 dark:text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
          </svg>
          {{ $t('settings.themeColors') }}
        </h3>
        <p class="text-sm text-surface-500">{{ $t('settings.themeColorsDesc') }}</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div v-for="color in colorKeys" :key="color.key" class="space-y-2">
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 capitalize">{{ $t(color.labelKey) }}</label>
            <div class="flex items-center gap-3">
              <div class="relative">
                <input
                  type="color"
                  v-model="form.colors[color.key]"
                  class="w-12 h-12 rounded-xl cursor-pointer border border-surface-200 dark:border-surface-600 bg-transparent"
                />
              </div>
              <input
                type="text"
                v-model="form.colors[color.key]"
                class="flex-1 px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
            <!-- Preview swatch -->
            <div class="h-3 rounded-full transition-all" :style="{ background: form.colors[color.key] }"></div>
          </div>
        </div>
      </div>

      <!-- Text Content Editor -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
        <h3 class="text-lg font-bold text-surface-800 dark:text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          {{ $t('settings.textContent') }}
        </h3>
        <p class="text-sm text-surface-500">{{ $t('settings.textContentDesc') }}</p>

        <!-- Language Tabs -->
        <div class="flex gap-2 border-b border-surface-200 dark:border-surface-700 pb-3">
          <button
            v-for="tab in textTabs"
            :key="tab.key"
            @click="activeTextTab = tab.key"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-all"
            :class="activeTextTab === tab.key
              ? 'bg-primary-500 text-white'
              : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Text fields -->
        <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          <div
            v-for="field in filteredTextFields"
            :key="field.key"
            class="p-3 bg-surface-50 dark:bg-surface-700/30 rounded-xl"
          >
            <label class="block text-xs font-medium text-surface-500 mb-1">{{ field.label }}</label>
            <input
              v-model="field.value"
              class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-primary-500/50"
              :placeholder="field.defaultValue"
            />
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end gap-3">
        <button @click="resetForm" class="px-6 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700">
          {{ $t('settings.reset') }}
        </button>
        <button @click="saveSettings" :disabled="saving"
          class="px-6 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2">
          <svg v-if="saving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ saving ? $t('settings.saving') : $t('settings.saveSettings') }}
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="fixed bottom-6 right-6 z-50 bg-accent-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up">
        ✅ {{ $t('settings.savedSuccessfully') }}
      </div>
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
