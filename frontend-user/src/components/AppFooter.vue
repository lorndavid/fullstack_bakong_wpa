<template>
  <footer class="mt-10 border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1 space-y-3">
          <router-link to="/" class="flex items-center gap-2">
            <div v-if="siteLogo" class="w-9 h-9 flex items-center justify-center">
              <img :src="siteLogo" alt="Logo" class="w-full h-full object-contain" />
            </div>
            <div v-else class="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-primary">
              <span class="text-white font-bold">{{ siteName.charAt(0) }}</span>
            </div>
            <span class="font-bold text-lg text-surface-900 dark:text-white">{{ siteName }}</span>
          </router-link>
          <p class="text-sm text-surface-500 dark:text-surface-400 leading-relaxed max-w-xs">
            {{ siteDescription }}
          </p>
          <!-- Social icons -->
          <div v-if="hasSocial" class="flex items-center gap-2 pt-1">
            <a
              v-for="s in activeSocials"
              :key="s.key"
              :href="s.url"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="s.key"
              class="w-9 h-9 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-600 dark:text-surface-300 hover:bg-primary-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5"
              v-html="s.icon"
            ></a>
          </div>
        </div>

        <!-- Shop links -->
        <div>
          <h4 class="text-sm font-bold text-surface-900 dark:text-white mb-3">{{ $t('footer.shop') }}</h4>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/" class="text-surface-500 hover:text-primary-600 dark:text-surface-400 transition-colors">{{ $t('nav.home') }}</router-link></li>
            <li><router-link to="/categories" class="text-surface-500 hover:text-primary-600 dark:text-surface-400 transition-colors">{{ $t('nav.categories') }}</router-link></li>
            <li><router-link to="/search?sort=discount" class="text-surface-500 hover:text-primary-600 dark:text-surface-400 transition-colors">{{ $t('home.flashSale') }}</router-link></li>
            <li><router-link to="/search?sort=newest" class="text-surface-500 hover:text-primary-600 dark:text-surface-400 transition-colors">{{ $t('home.newArrivals') }}</router-link></li>
          </ul>
        </div>

        <!-- Account links -->
        <div>
          <h4 class="text-sm font-bold text-surface-900 dark:text-white mb-3">{{ $t('footer.account') }}</h4>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/profile" class="text-surface-500 hover:text-primary-600 dark:text-surface-400 transition-colors">{{ $t('nav.profile') }}</router-link></li>
            <li><router-link to="/orders" class="text-surface-500 hover:text-primary-600 dark:text-surface-400 transition-colors">{{ $t('nav.orders') }}</router-link></li>
            <li><router-link to="/cart" class="text-surface-500 hover:text-primary-600 dark:text-surface-400 transition-colors">{{ $t('nav.cart') }}</router-link></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-sm font-bold text-surface-900 dark:text-white mb-3">{{ $t('footer.contact') }}</h4>
          <ul class="space-y-2.5 text-sm">
            <li v-if="social.phone" class="flex items-center gap-2 text-surface-500 dark:text-surface-400">
              <svg class="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6z"/></svg>
              <a :href="`tel:${social.phone}`" class="hover:text-primary-600">{{ social.phone }}</a>
            </li>
            <li v-if="social.email" class="flex items-center gap-2 text-surface-500 dark:text-surface-400">
              <svg class="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>
              <a :href="`mailto:${social.email}`" class="hover:text-primary-600 break-all">{{ social.email }}</a>
            </li>
            <li v-if="social.address" class="flex items-start gap-2 text-surface-500 dark:text-surface-400">
              <svg class="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>{{ social.address }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Trust badges -->
      <div class="mt-8 pt-6 border-t border-surface-100 dark:border-surface-700 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div v-for="b in badges" :key="b.title" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 flex-shrink-0" v-html="b.icon"></div>
          <div class="min-w-0">
            <p class="text-xs font-semibold text-surface-800 dark:text-white truncate">{{ b.title }}</p>
            <p class="text-[11px] text-surface-400 truncate">{{ b.sub }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-surface-100 dark:border-surface-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="text-xs text-surface-400">© {{ year }} {{ siteName }}. {{ $t('footer.allRightsReserved') }}</p>
        <div class="flex items-center gap-1.5 text-surface-400">
          <span class="text-xs">Powered by KHQR</span>
          <svg viewBox="0 0 40 40" class="w-5 h-5"><rect width="40" height="40" rx="8" fill="#E2001A"/><text x="20" y="25" text-anchor="middle" fill="white" font-family="Arial Black, Arial, sans-serif" font-size="10" font-weight="900">KHQR</text></svg>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'

const { t } = useI18n()
const siteLogo = inject('siteLogo', ref('')) as Ref<string>
const year = new Date().getFullYear()

const siteName = ref('MY SHOP')
const siteDescription = ref('Premium skincare shopping experience')
const social = ref<Record<string, string>>({
  facebook: '', instagram: '', tiktok: '', telegram: '',
  youtube: '', twitter: '', phone: '', email: '', address: '',
})

const iconMap: Record<string, string> = {
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M24 12a12 12 0 10-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.4 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0024 12z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.5A6.3 6.3 0 1018.3 12 6.3 6.3 0 0012 5.7zm0 10.4A4.1 4.1 0 1116.1 12 4.1 4.1 0 0112 16.1zm6.5-10.6a1.5 1.5 0 11-1.5-1.5 1.5 1.5 0 011.5 1.5z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M16.6 5.8a4.3 4.3 0 01-1-2.8h-3.3v13.2a2.4 2.4 0 11-2.4-2.4c.2 0 .5 0 .7.1V8.5a5.7 5.7 0 00-.7 0 5.7 5.7 0 105.7 5.7V8.6a7.5 7.5 0 004.4 1.4V6.7a4.3 4.3 0 01-3.4-.9z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 6.9l-1.5 7.3c-.1.5-.4.6-.9.4l-2.5-1.8-1.2 1.1c-.1.1-.2.2-.5.2l.2-2.5 4.6-4.1c.2-.2 0-.3-.3-.1L9 13l-2.4-.8c-.5-.2-.5-.5.1-.8l9.5-3.6c.4-.2.8.1.7.6z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M23 7.5a3 3 0 00-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 001 7.5 31 31 0 001 12a31 31 0 00.1 4.5 3 3 0 002.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 002.1-2.1A31 31 0 0023 12a31 31 0 00-.1-4.5zM10 15V9l5 3z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M18.2 2h3.3l-7.2 8.3L23 22h-6.6l-5.2-6.8L5.2 22H1.9l7.7-8.8L1 2h6.8l4.7 6.2zm-1.2 18h1.8L7.1 3.9H5.2z"/></svg>',
}

const socialOrder = ['facebook', 'instagram', 'tiktok', 'telegram', 'youtube', 'twitter']

const activeSocials = computed(() =>
  socialOrder
    .filter((key) => social.value[key])
    .map((key) => ({ key, url: social.value[key], icon: iconMap[key] }))
)

const hasSocial = computed(() => activeSocials.value.length > 0)

const badges = computed(() => [
  { title: t('footer.freeShipping'), sub: t('footer.freeShippingSub'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>' },
  { title: t('footer.securePayment'), sub: t('footer.securePaymentSub'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.6-1A12 12 0 0112 2.9 12 12 0 013.4 6 12 12 0 003 9c0 5.6 3.8 10.3 9 11.6 5.2-1.3 9-6 9-11.6 0-1-.1-2-.4-3z"/></svg>' },
  { title: t('footer.qualityGuarantee'), sub: t('footer.qualityGuaranteeSub'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.3 5.5L22 12l-4.7 1.5L15 19l-2.3-5.5L8 12l4.7-1.5z"/></svg>' },
  { title: t('footer.support'), sub: t('footer.supportSub'), icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M18 10a8 8 0 10-16 0v4a2 2 0 002 2h1v-6H4m14 0h-1v6h1a2 2 0 002-2v-2a8 8 0 00-4-6"/></svg>' },
])

onMounted(async () => {
  try {
    const data: any = await api.get('/settings')
    const s = data.settings || {}
    siteName.value = s.siteName || 'MY SHOP'
    siteDescription.value = s.siteDescription || siteDescription.value
    if (s.social) {
      social.value = { ...social.value, ...s.social }
    }
  } catch {
    // optional
  }
})
</script>
