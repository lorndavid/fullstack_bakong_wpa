<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-surface-800 dark:text-white">Payway Gateway</h2>
          <p class="text-xs text-surface-400">Configure digital payment gateways for your store</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="savedSuccess" class="text-xs text-accent-500 font-medium flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Saved
        </span>
        <button @click="saveSettings" :disabled="saving"
          class="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm">
          <svg v-if="saving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-3 text-sm text-surface-500">Loading configuration...</p>
    </div>

    <!-- Gateway Cards -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- ABA PayWay -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden border border-surface-100 dark:border-surface-700 hover:shadow-card-hover transition-all duration-200">
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#003288] to-[#002266] px-6 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span class="text-white font-bold text-lg">ABA</span>
              </div>
              <div class="text-white">
                <h3 class="text-lg font-bold">ABA PayWay</h3>
                <p class="text-sm text-white/70">PayWay KHQR Payment Gateway</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" v-model="form.abaEnabled" class="sr-only peer">
              <div class="w-11 h-6 bg-white/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/90"></div>
            </label>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <!-- Status Badge -->
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="form.abaEnabled ? 'bg-emerald-500' : 'bg-surface-300'"></span>
            <span class="text-sm font-medium" :class="form.abaEnabled ? 'text-emerald-600' : 'text-surface-400'">
              {{ form.abaEnabled ? 'Active - Customers can pay with ABA PayWay' : 'Inactive - Hidden from checkout' }}
            </span>
          </div>

          <!-- ABA Merchant Link -->
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">
              ABA Merchant Link
              <span class="text-xs text-surface-400 font-normal">(Copy from ABA PayWay dashboard)</span>
            </label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              <input v-model="form.abaMerchantLink" type="url"
                placeholder="https://link.payway.com.kh/ABAPAY0j459666x"
                class="w-full pl-10 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500/50 transition-all" />
            </div>
            <p class="text-xs text-surface-400 mt-1.5">The merchant URL provided by ABA PayWay. Used to generate payment QR codes.</p>
          </div>

          <!-- API Status -->
          <div class="bg-[#F0F4FF] dark:bg-blue-900/10 rounded-xl p-4 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-surface-500 font-medium">API Endpoint</span>
              <code class="font-mono text-surface-600 dark:text-surface-300 bg-white dark:bg-surface-800 px-2 py-0.5 rounded">https://api.anajak.site</code>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-surface-500 font-medium">Provider</span>
              <code class="font-mono text-surface-600 dark:text-surface-300 bg-white dark:bg-surface-800 px-2 py-0.5 rounded">ABA_PAYWAY</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Bakong KHQR -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden border border-surface-100 dark:border-surface-700 hover:shadow-card-hover transition-all duration-200">
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#F7931E] to-[#E5821A] px-6 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5" fill="none"/>
                  <path d="M8 16 L12 8 L16 16Z" fill="white" opacity="0.9"/>
                </svg>
              </div>
              <div class="text-white">
                <h3 class="text-lg font-bold">Bakong KHQR</h3>
                <p class="text-sm text-white/70">National Bank of Cambodia KHQR</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" v-model="form.bakongEnabled" class="sr-only peer">
              <div class="w-11 h-6 bg-white/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/90"></div>
            </label>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <!-- Status Badge -->
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="form.bakongEnabled ? 'bg-emerald-500' : 'bg-surface-300'"></span>
            <span class="text-sm font-medium" :class="form.bakongEnabled ? 'text-emerald-600' : 'text-surface-400'">
              {{ form.bakongEnabled ? 'Active - Customers can pay with Bakong KHQR' : 'Inactive - Hidden from checkout' }}
            </span>
          </div>

          <!-- Bakong Account ID -->
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">
              Bakong Account ID
              <span class="text-xs text-surface-400 font-normal">(e.g. lorn_davit@bkrt)</span>
            </label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <input v-model="form.bakongAccountId" type="text"
                placeholder="your_account@bkrt"
                class="w-full pl-10 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500/50 transition-all" />
            </div>
            <p class="text-xs text-surface-400 mt-1.5">Your Bakong KHQR merchant account ID. This is used to generate the QR code for payments.</p>
          </div>

          <!-- API Status -->
          <div class="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-surface-500 font-medium">SDK</span>
              <code class="font-mono text-surface-600 dark:text-surface-300 bg-white dark:bg-surface-800 px-2 py-0.5 rounded">bakong-khqr (local)</code>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-surface-500 font-medium">Verification</span>
              <code class="font-mono text-surface-600 dark:text-surface-300 bg-white dark:bg-surface-800 px-2 py-0.5 rounded">Bakong API /v1/check_transaction_by_md5</code>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuration Summary -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
      <h3 class="text-base font-bold text-surface-800 dark:text-white mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        Gateway Status Overview
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="rounded-xl p-4 border" :class="form.abaEnabled ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-surface-50 dark:bg-surface-700/30 border-surface-200 dark:border-surface-700'">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-3 h-3 rounded-full" :class="form.abaEnabled ? 'bg-emerald-500' : 'bg-surface-300'"></div>
            <span class="text-sm font-semibold" :class="form.abaEnabled ? 'text-[#003288]' : 'text-surface-400'">ABA PayWay</span>
          </div>
          <p class="text-xs text-surface-500">KHQR payment via ABA bank. Customers scan using ABA Mobile app.</p>
          <div v-if="form.abaMerchantLink" class="mt-2 text-[10px] font-mono text-surface-400 truncate">
            {{ form.abaMerchantLink }}
          </div>
        </div>
        <div class="rounded-xl p-4 border" :class="form.bakongEnabled ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-surface-50 dark:bg-surface-700/30 border-surface-200 dark:border-surface-700'">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-3 h-3 rounded-full" :class="form.bakongEnabled ? 'bg-emerald-500' : 'bg-surface-300'"></div>
            <span class="text-sm font-semibold" :class="form.bakongEnabled ? 'text-[#F7931E]' : 'text-surface-400'">Bakong KHQR</span>
          </div>
          <p class="text-xs text-surface-500">National Bank of Cambodia KHQR. Scan with any participating banking app.</p>
          <div v-if="form.bakongAccountId" class="mt-2 text-[10px] font-mono text-surface-400">
            Account: {{ form.bakongAccountId }}
          </div>
        </div>
      </div>
    </div>

    <!-- How it works -->
    <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
      <h3 class="text-base font-bold text-surface-800 dark:text-white mb-4">How it Works</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="text-center p-4">
          <div class="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span class="text-primary-500 font-bold text-lg">1</span>
          </div>
          <p class="text-sm font-semibold text-surface-800 dark:text-white">Configure Gateway</p>
          <p class="text-xs text-surface-400 mt-1">Set up ABA merchant link and Bakong account ID in this page</p>
        </div>
        <div class="text-center p-4">
          <div class="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span class="text-primary-500 font-bold text-lg">2</span>
          </div>
          <p class="text-sm font-semibold text-surface-800 dark:text-white">Customer Selects</p>
          <p class="text-xs text-surface-400 mt-1">At checkout, active gateways appear. QR code is auto-generated</p>
        </div>
        <div class="text-center p-4">
          <div class="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span class="text-primary-500 font-bold text-lg">3</span>
          </div>
          <p class="text-sm font-semibold text-surface-800 dark:text-white">Payment Verified</p>
          <p class="text-xs text-surface-400 mt-1">System automatically verifies payment and confirms the order</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const saving = ref(false)
const savedSuccess = ref(false)

const form = reactive({
  abaEnabled: true,
  bakongEnabled: true,
  abaMerchantLink: '',
  bakongAccountId: '',
})

let successTimeout: ReturnType<typeof setTimeout>

onMounted(async () => {
  try {
    const data: any = await api.get('/settings')
    const s = data.settings || {}
    form.abaEnabled = s.abaEnabled !== false
    form.bakongEnabled = s.bakongEnabled !== false
    form.abaMerchantLink = s.abaMerchantLink || 'https://link.payway.com.kh/ABAPAY0j459666x'
    form.bakongAccountId = s.bakongAccountId || ''
  } catch (err: any) {
    console.error('Failed to load settings:', err)
  } finally {
    loading.value = false
  }
})

async function saveSettings() {
  saving.value = true
  savedSuccess.value = false
  if (successTimeout) clearTimeout(successTimeout)
  try {
    await api.put('/settings', {
      abaEnabled: String(form.abaEnabled),
      bakongEnabled: String(form.bakongEnabled),
      abaMerchantLink: form.abaMerchantLink,
      bakongAccountId: form.bakongAccountId,
    })
    savedSuccess.value = true
    successTimeout = setTimeout(() => { savedSuccess.value = false }, 3000)
  } catch (err: any) {
    console.error('Failed to save settings:', err)
  } finally {
    saving.value = false
  }
}
</script>
