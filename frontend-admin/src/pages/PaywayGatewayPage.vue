<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-surface-800 dark:text-white">Payway Gateway</h2>
          <p class="text-xs text-surface-400">Configure digital payment gateways shown to your customers at checkout</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="savedSuccess" class="text-xs text-accent-500 font-medium flex items-center gap-1.5 px-2.5 py-1 bg-accent-50 dark:bg-accent-900/20 rounded-full">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
          Saved
        </span>
        <button
          @click="saveSettings"
          :disabled="saving"
          class="px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm">
          <svg v-if="saving" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <div class="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-3 text-sm text-surface-500">Loading configuration...</p>
    </div>

    <template v-else>
      <!-- Gateway Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- ─── ABA PayWay ─────────────────────────────────────── -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden border border-surface-100 dark:border-surface-700 transition-all duration-200"
          :class="form.abaEnabled ? 'hover:shadow-card-hover' : 'opacity-95'">
          <!-- Header (real ABA blue gradient) -->
          <div class="relative bg-gradient-to-br from-[#003288] via-[#003884] to-[#002266] px-6 py-5 overflow-hidden">
            <!-- Background pattern -->
            <div class="absolute inset-0 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 100" preserveAspectRatio="none" class="w-full h-full">
                <circle cx="170" cy="20" r="40" fill="white"/>
                <circle cx="190" cy="80" r="25" fill="white"/>
              </svg>
            </div>

            <div class="relative flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- ABA Logo (real-style) -->
                <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <AbaLogo class="w-9 h-9" />
                </div>
                <div class="text-white">
                  <h3 class="text-lg font-bold tracking-tight">ABA PayWay</h3>
                  <p class="text-xs text-white/70 font-medium">KHQR Payment Gateway · Stripe-style</p>
                </div>
              </div>
              <ToggleSwitch v-model="form.abaEnabled" />
            </div>
          </div>

          <div class="p-6 space-y-5">
            <!-- Status Badge -->
            <div class="flex items-center gap-2">
              <span class="relative flex h-2.5 w-2.5">
                <span v-if="form.abaEnabled" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5"
                  :class="form.abaEnabled ? 'bg-emerald-500' : 'bg-surface-300 dark:bg-surface-600'"></span>
              </span>
              <span class="text-sm font-medium" :class="form.abaEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-surface-400'">
                {{ form.abaEnabled ? 'Active — Visible at checkout' : 'Inactive — Hidden from customers' }}
              </span>
            </div>

            <!-- ABA Merchant Link -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">
                ABA Merchant Link
                <span class="text-xs text-surface-400 font-normal">(from ABA PayWay merchant portal)</span>
              </label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
                <input
                  v-model="form.abaMerchantLink"
                  type="url"
                  placeholder="https://link.payway.com.kh/ABAPAY0j459666x"
                  class="w-full pl-10 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#003288]/30 focus:border-[#003288] transition-all" />
              </div>
              <p class="text-xs text-surface-400 mt-1.5">Public URL of your ABA merchant page. The system uses it to generate a fresh KHQR for each order.</p>
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
              <div class="flex items-center justify-between text-xs">
                <span class="text-surface-500 font-medium">Expiry</span>
                <code class="font-mono text-surface-600 dark:text-surface-300 bg-white dark:bg-surface-800 px-2 py-0.5 rounded">180 seconds</code>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── Bakong KHQR ─────────────────────────────────────── -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden border border-surface-100 dark:border-surface-700 transition-all duration-200"
          :class="form.bakongEnabled ? 'hover:shadow-card-hover' : 'opacity-95'">
          <!-- Header (real KHQR red) -->
          <div class="relative bg-gradient-to-br from-[#E2001A] via-[#C70016] to-[#A30012] px-6 py-5 overflow-hidden">
            <div class="absolute inset-0 opacity-10 pointer-events-none">
              <svg viewBox="0 0 200 100" preserveAspectRatio="none" class="w-full h-full">
                <rect x="140" y="10" width="80" height="80" fill="white" transform="rotate(15 180 50)"/>
              </svg>
            </div>

            <div class="relative flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- KHQR Logo (real-style) -->
                <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <KhqrLogo class="w-10 h-10" />
                </div>
                <div class="text-white">
                  <h3 class="text-lg font-bold tracking-tight">Bakong KHQR</h3>
                  <p class="text-xs text-white/70 font-medium">National Bank of Cambodia · KHQR Standard</p>
                </div>
              </div>
              <ToggleSwitch v-model="form.bakongEnabled" />
            </div>
          </div>

          <div class="p-6 space-y-5">
            <!-- Status Badge -->
            <div class="flex items-center gap-2">
              <span class="relative flex h-2.5 w-2.5">
                <span v-if="form.bakongEnabled" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5"
                  :class="form.bakongEnabled ? 'bg-emerald-500' : 'bg-surface-300 dark:bg-surface-600'"></span>
              </span>
              <span class="text-sm font-medium" :class="form.bakongEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-surface-400'">
                {{ form.bakongEnabled ? 'Active — Visible at checkout' : 'Inactive — Hidden from customers' }}
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
                <input
                  v-model="form.bakongAccountId"
                  type="text"
                  placeholder="your_account@bkrt"
                  class="w-full pl-10 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-sm font-mono focus:ring-2 focus:ring-[#E2001A]/30 focus:border-[#E2001A] transition-all" />
              </div>
              <p class="text-xs text-surface-400 mt-1.5">Your Bakong KHQR merchant ID — the system uses it to build a valid KHQR per the EMVCo standard.</p>
            </div>

            <!-- Merchant info (optional) -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-surface-700 dark:text-surface-200 mb-1">Merchant Name</label>
                <input
                  v-model="form.merchantName"
                  type="text"
                  placeholder="MY SHOP"
                  class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-[#E2001A]/30 transition-all" />
              </div>
              <div>
                <label class="block text-xs font-medium text-surface-700 dark:text-surface-200 mb-1">Merchant City</label>
                <input
                  v-model="form.merchantCity"
                  type="text"
                  placeholder="Phnom Penh"
                  class="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-[#E2001A]/30 transition-all" />
              </div>
            </div>

            <!-- API Status -->
            <div class="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-surface-500 font-medium">SDK</span>
                <code class="font-mono text-surface-600 dark:text-surface-300 bg-white dark:bg-surface-800 px-2 py-0.5 rounded">bakong-khqr (local)</code>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-surface-500 font-medium">Verification</span>
                <code class="font-mono text-surface-600 dark:text-surface-300 bg-white dark:bg-surface-800 px-2 py-0.5 rounded">Bakong API /v1/check_transaction_by_md5</code>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-surface-500 font-medium">Expiry</span>
                <code class="font-mono text-surface-600 dark:text-surface-300 bg-white dark:bg-surface-800 px-2 py-0.5 rounded">180 seconds</code>
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
          <div class="rounded-xl p-4 border transition-colors"
            :class="form.abaEnabled ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-surface-50 dark:bg-surface-700/30 border-surface-200 dark:border-surface-700'">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-3 h-3 rounded-full" :class="form.abaEnabled ? 'bg-emerald-500' : 'bg-surface-300'"></div>
              <span class="text-sm font-semibold" :class="form.abaEnabled ? 'text-[#003288] dark:text-blue-300' : 'text-surface-400'">ABA PayWay</span>
            </div>
            <p class="text-xs text-surface-500">KHQR payment via ABA bank. Customers scan with the ABA Mobile app.</p>
            <div v-if="form.abaMerchantLink" class="mt-2 text-[10px] font-mono text-surface-400 truncate">{{ form.abaMerchantLink }}</div>
          </div>
          <div class="rounded-xl p-4 border transition-colors"
            :class="form.bakongEnabled ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-surface-50 dark:bg-surface-700/30 border-surface-200 dark:border-surface-700'">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-3 h-3 rounded-full" :class="form.bakongEnabled ? 'bg-emerald-500' : 'bg-surface-300'"></div>
              <span class="text-sm font-semibold" :class="form.bakongEnabled ? 'text-[#E2001A]' : 'text-surface-400'">Bakong KHQR</span>
            </div>
            <p class="text-xs text-surface-500">NBC KHQR standard. Scan with any participating banking app in Cambodia.</p>
            <div v-if="form.bakongAccountId" class="mt-2 text-[10px] font-mono text-surface-400">Account: {{ form.bakongAccountId }}</div>
          </div>
        </div>

        <!-- Warning if both disabled -->
        <div v-if="!form.abaEnabled && !form.bakongEnabled" class="mt-4 flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="text-sm font-semibold text-amber-700 dark:text-amber-300">Both gateways are disabled</p>
            <p class="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Customers will only be able to pay with Cash on Delivery. Enable at least one digital gateway to accept online payments.</p>
          </div>
        </div>
      </div>

      <!-- How it works -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card">
        <h3 class="text-base font-bold text-surface-800 dark:text-white mb-4">How it Works</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="text-center p-4">
            <div class="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span class="text-primary-500 font-bold text-lg">1</span>
            </div>
            <p class="text-sm font-semibold text-surface-800 dark:text-white">Configure Gateway</p>
            <p class="text-xs text-surface-400 mt-1">Set up ABA merchant link and Bakong account ID on this page.</p>
          </div>
          <div class="text-center p-4">
            <div class="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span class="text-primary-500 font-bold text-lg">2</span>
            </div>
            <p class="text-sm font-semibold text-surface-800 dark:text-white">Customer Selects</p>
            <p class="text-xs text-surface-400 mt-1">At checkout, only enabled gateways appear. A fresh QR is generated automatically.</p>
          </div>
          <div class="text-center p-4">
            <div class="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span class="text-primary-500 font-bold text-lg">3</span>
            </div>
            <p class="text-sm font-semibold text-surface-800 dark:text-white">Payment Verified</p>
            <p class="text-xs text-surface-400 mt-1">The system polls each provider and confirms the order in real time.</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '@/services/api'
import AbaLogo from '@/components/payway/AbaLogo.vue'
import KhqrLogo from '@/components/payway/KhqrLogo.vue'
import ToggleSwitch from '@/components/payway/ToggleSwitch.vue'

const loading = ref(true)
const saving = ref(false)
const savedSuccess = ref(false)

const form = reactive({
  abaEnabled: true,
  bakongEnabled: true,
  abaMerchantLink: '',
  bakongAccountId: '',
  merchantName: '',
  merchantCity: '',
})

let successTimeout: ReturnType<typeof setTimeout> | undefined

onMounted(async () => {
  try {
    const data: any = await api.get('/settings')
    const s = data.settings || {}
    const p = s.payment || {}
    form.abaEnabled = (p.abaEnabled ?? s.abaEnabled) !== false
    form.bakongEnabled = (p.bakongEnabled ?? s.bakongEnabled) !== false
    form.abaMerchantLink = p.abaMerchantLink ?? s.abaMerchantLink ?? ''
    form.bakongAccountId = p.bakongAccountId ?? s.bakongAccountId ?? ''
    form.merchantName = p.merchantName ?? s.siteName ?? ''
    form.merchantCity = p.merchantCity ?? ''
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
      payment: {
        abaEnabled: form.abaEnabled,
        bakongEnabled: form.bakongEnabled,
        abaMerchantLink: form.abaMerchantLink,
        bakongAccountId: form.bakongAccountId,
        merchantName: form.merchantName,
        merchantCity: form.merchantCity,
      },
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
