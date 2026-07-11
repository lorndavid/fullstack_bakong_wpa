<template>
  <div class="space-y-6 sm:space-y-8 pb-6">
    <!-- Loading State -->
    <HomeSkeleton v-if="loading && heroSlides.length === 0" />

    <!-- Loaded Content -->
    <template v-else>
      <!-- Hero Banner Carousel -->
      <section class="relative overflow-hidden">
        <div class="relative max-w-full sm:max-w-[90%] lg:max-w-[80%] mx-auto sm:rounded-2xl overflow-hidden shadow-2xl">
          <div v-for="(slide, idx) in heroSlides" :key="idx"
            class="transition-all duration-700 ease-in-out"
            :class="idx === currentHeroSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'">
            <div v-if="slide.image" class="relative">
              <img :src="slide.image.secure_url" :alt="slide.title || 'Slide ' + (idx + 1)" class="w-full h-[180px] xs:h-[220px] sm:h-[340px] lg:h-[420px] object-cover" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
              <div class="absolute inset-0 flex items-center">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 w-full">
                  <div class="max-w-lg space-y-2 xs:space-y-3 sm:space-y-4 animate-slide-up">
                    <span v-if="slide.subtitle" class="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">{{ slide.subtitle }}</span>
                    <h1 class="text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">{{ slide.title || 'Welcome to MY SHOP' }}</h1>
                    <p v-if="slide.description" class="text-white/80 text-xs xs:text-sm sm:text-base leading-relaxed">{{ slide.description }}</p>
                    <router-link :to="slide.link || '/search'" class="inline-flex items-center justify-center px-3 xs:px-5 py-2 xs:py-2.5 bg-white text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-all text-xs xs:text-sm sm:text-base shadow-lg whitespace-nowrap">
                      <svg class="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                      {{ $t('home.shopNow') }}
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading hero skeleton -->
          <BannerSkeleton v-if="heroSlides.length === 0 && !heroSlidesError" />

          <!-- Hero Slide Dots -->
          <div v-if="heroSlides.length > 1" class="absolute bottom-3 xs:bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-1.5 xs:gap-2 z-10">
            <button
              v-for="(_, idx) in heroSlides"
              :key="idx"
              @click="currentHeroSlide = idx"
              class="h-1.5 xs:h-2 rounded-full transition-all duration-300"
              :class="idx === currentHeroSlide ? 'w-6 xs:w-8 bg-white' : 'w-1.5 xs:w-2 bg-white/50 hover:bg-white/70'"
              :aria-label="'Slide ' + (idx + 1)"
            ></button>
          </div>
        </div>
      </section>

      <!-- Flash Sale -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <h2 class="text-lg sm:text-xl font-bold text-surface-800 dark:text-white">{{ $t('home.flashSale') }}</h2>
            <div class="flex items-center space-x-1.5" v-if="flashTimer.hours">
              <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded tabular-nums">{{ flashTimer.hours }}</span>
              <span class="text-surface-400 font-bold">:</span>
              <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded tabular-nums">{{ flashTimer.minutes }}</span>
              <span class="text-surface-400 font-bold">:</span>
              <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded tabular-nums">{{ flashTimer.seconds }}</span>
            </div>
          </div>
          <router-link to="/search?sort=discount" class="text-sm text-primary-500 hover:text-primary-600 font-medium">{{ $t('nav.viewAll') }}</router-link>
        </div>

        <div v-if="loading" class="product-grid">
          <ProductCardSkeleton v-for="i in 5" :key="i" />
        </div>
        <div v-else-if="flashSaleProducts.length > 0" class="product-grid">
          <ProductCard v-for="product in flashSaleProducts" :key="product._id" :product="product" />
        </div>
        <div v-else-if="flashError" class="text-center py-8 bg-white dark:bg-surface-800 rounded-2xl">
          <p class="text-sm text-red-500">{{ flashError }}</p>
        </div>
        <div v-else class="text-center py-8 bg-white dark:bg-surface-800 rounded-2xl">
          <p class="text-sm text-surface-500">{{ $t('home.noFlashSale') }}</p>
        </div>
      </section>

      <!-- Categories (moved up after flash sale) -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg sm:text-xl font-bold text-surface-800 dark:text-white">{{ $t('home.categories') }}</h2>
          <router-link to="/categories" class="text-sm text-primary-500 hover:text-primary-600 font-medium">{{ $t('nav.viewAll') }}</router-link>
        </div>
        <CategorySkeleton v-if="loading" />
        <div v-else-if="categoriesError" class="text-center py-4">
          <p class="text-sm text-surface-500">{{ categoriesError }}</p>
        </div>
        <div v-else class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          <div v-for="cat in categories" :key="cat._id" @click="goToCategory(cat._id)"
            class="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-surface-800 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-250 cursor-pointer hover:-translate-y-0.5">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-primary-50 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-xl sm:text-2xl">{{ cat.icon }}</div>
            <span class="text-xs text-surface-600 dark:text-surface-300 font-medium text-center truncate w-full">{{ cat.name }}</span>
          </div>
        </div>
      </section>

      <!-- Active Promotions -->
      <section v-if="activePromotions.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg sm:text-xl font-bold text-surface-800 dark:text-white">{{ $t('home.promotions') }}</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="promo in activePromotions" :key="promo._id" @click="goToSearchPromotion"
            class="group relative bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden cursor-pointer hover:-translate-y-1 border border-surface-100 dark:border-surface-700">
            <div v-if="promo.bannerImage" class="relative aspect-video bg-surface-100 dark:bg-surface-700 overflow-hidden">
              <img :src="promo.bannerImage.secure_url" :alt="promo.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div class="absolute bottom-3 left-3 right-3 z-10">
                <span class="px-2.5 py-1 bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm">-{{ promo.discountPercent }}% OFF</span>
              </div>
            </div>
            <div v-else class="relative aspect-video bg-gradient-to-br from-rose-100 via-rose-50 to-orange-50 dark:from-rose-900/30 dark:via-rose-800/20 dark:to-orange-900/20 flex items-center justify-center">
              <span class="inline-block px-3 py-1.5 bg-rose-500 text-white text-sm font-bold rounded-lg shadow-sm">-{{ promo.discountPercent }}% OFF</span>
            </div>
            <div class="p-4 space-y-2">
              <h3 class="font-semibold text-surface-800 dark:text-white truncate group-hover:text-rose-500 transition-colors">{{ promo.name }}</h3>
              <p v-if="promo.description" class="text-xs text-surface-500 line-clamp-2">{{ promo.description }}</p>
              <div class="flex items-center gap-2 text-xs">
                <svg class="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span class="text-surface-400">Ends in</span>
                <span class="font-semibold text-rose-500 tabular-nums">{{ getPromoTimeLeft(promo.endDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Coupons -->
      <section v-if="highlightedCoupons.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            <h2 class="text-lg sm:text-xl font-bold text-surface-800 dark:text-white">{{ $t('coupons.featuredCoupons') }}</h2>
          </div>
          <router-link to="/coupons" class="text-sm text-purple-500 hover:text-purple-600 font-medium">{{ $t('nav.viewAll') }}</router-link>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="coupon in highlightedCoupons" :key="coupon._id" @click="goToCoupon(coupon._id)"
            class="group relative bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden cursor-pointer hover:-translate-y-1 border border-surface-100 dark:border-surface-700">
            <div v-if="coupon.bannerImage" class="relative aspect-video bg-surface-100 dark:bg-surface-700 overflow-hidden">
              <img :src="coupon.bannerImage.secure_url" :alt="coupon.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            </div>
            <div v-else class="relative aspect-video flex items-center justify-center" :style="{ background: coupon.themeColor || '#6366F1' }">
              <div class="text-center text-white"><p class="text-3xl font-black">{{ coupon.discountType === 'percentage' ? coupon.discountValue + '%' : coupon.discountType === 'fixed' ? '$' + coupon.discountValue : '🚚' }}</p><p class="text-sm font-bold mt-1">{{ coupon.discountType === 'free_shipping' ? 'FREE SHIPPING' : 'OFF' }}</p></div>
            </div>
            <div class="p-4 space-y-2">
              <h3 class="font-semibold text-surface-800 dark:text-white truncate group-hover:text-purple-500 transition-colors">{{ coupon.name }}</h3>
              <p v-if="coupon.description" class="text-xs text-surface-500 line-clamp-2">{{ coupon.description }}</p>
              <div class="flex items-center justify-between text-xs">
                <code class="text-surface-400 font-mono bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded">{{ coupon.code }}</code>
                <span class="text-surface-400">{{ getCouponTimeLeft(coupon.endDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Free Shipping Banner / Auto Deploy Test -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl p-6 sm:p-8 text-white animate-fade-in overflow-hidden relative">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div class="flex items-center justify-between relative z-10">
            <div class="space-y-2">
              <span class="inline-block px-3 py-1 bg-white/20 text-xs font-semibold rounded-full backdrop-blur-sm">🎉 {{ $t('home.alwaysFreeShipping') }}</span>
              <h3 class="text-xl sm:text-2xl font-bold">{{ $t('home.freeShipping') }}</h3>
              <p class="text-white/80 text-sm">{{ $t('home.freeShippingDesc') }}</p>
              <div class="flex items-center gap-1.5 text-xs text-white/60">
                <span class="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                <span>Auto Deploy Active</span>
              </div>
            </div>
            <div class="text-right hidden sm:block">
              <svg class="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
            </div>
          </div>
        </div>
      </section>

      <!-- New Arrivals -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg sm:text-xl font-bold text-surface-800 dark:text-white">{{ $t('home.newArrivals') }}</h2>
          <router-link to="/search?sort=newest" class="text-sm text-primary-500 hover:text-primary-600 font-medium">{{ $t('nav.viewAll') }}</router-link>
        </div>

        <div v-if="loading" class="product-grid">
          <ProductCardSkeleton v-for="i in 5" :key="i" />
        </div>
        <div v-else-if="newArrivals.length > 0" class="product-grid">
          <ProductCard v-for="product in newArrivals" :key="product._id" :product="product" :badge="$t('home.newArrivals')" />
        </div>
        <div v-else-if="arrivalsError" class="text-center py-8 bg-white dark:bg-surface-800 rounded-2xl">
          <p class="text-sm text-red-500">{{ arrivalsError }}</p>
        </div>
        <div v-else class="text-center py-8 bg-white dark:bg-surface-800 rounded-2xl">
          <p class="text-sm text-surface-500">{{ $t('home.noNewArrivals') }}</p>
        </div>
      </section>
    </template>

    <div class="h-4"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import ProductCard from '@/components/ProductCard.vue'
import HomeSkeleton from '@/components/skeleton/HomeSkeleton.vue'
import BannerSkeleton from '@/components/skeleton/BannerSkeleton.vue'
import CategorySkeleton from '@/components/skeleton/CategorySkeleton.vue'
import ProductCardSkeleton from '@/components/skeleton/ProductCardSkeleton.vue'

// Interfaces
interface Category { _id: string; name: string; icon: string }
interface Product { _id: string; name: string; description: string; price: number; stock: number; discount: number; images: { public_id: string; secure_url: string }[]; category: Category | string; rating: number; numReviews: number; sold: number; featured: boolean; createdAt: string }
interface Promotion { _id: string; name: string; description: string; discountPercent: number; selectedProducts: any[]; selectedCategories: any[]; applyToAll: boolean; startDate: string; endDate: string; isActive: boolean; bannerImage?: { public_id: string; secure_url: string } }
interface HighlightedCoupon { _id: string; name: string; code: string; description: string; discountType: 'percentage' | 'fixed' | 'free_shipping'; discountValue: number; endDate: string; themeColor: string; bannerImage?: { public_id: string; secure_url: string } }

const router = useRouter()

// State
const categories = ref<Category[]>([])
const flashSaleProducts = ref<Product[]>([])
const newArrivals = ref<Product[]>([])
const heroSlides = ref<any[]>([])
const activePromotions = ref<Promotion[]>([])
const highlightedCoupons = ref<HighlightedCoupon[]>([])
const currentHeroSlide = ref(0)
const loading = ref(true)
const categoriesError = ref<string | null>(null)
const flashError = ref<string | null>(null)
const arrivalsError = ref<string | null>(null)
const heroSlidesError = ref<string | null>(null)
const promotionsError = ref<string | null>(null)

// Timers
const promoTimeLeft = ref<Record<string, string>>({})
const couponTimeLeft = ref<Record<string, string>>({})
let promoInterval: ReturnType<typeof setInterval> | null = null

function getPromoTimeLeft(endDate: string): string { return promoTimeLeft.value[endDate] || '--:--:--' }
function getCouponTimeLeft(endDate: string): string { return couponTimeLeft.value[endDate] || '--:--:--' }

function updatePromoTimers() {
  const now = new Date().getTime()
  activePromotions.value.forEach(promo => {
    const end = new Date(promo.endDate).getTime()
    const diff = Math.floor((end - now) / 1000)
    if (diff > 0) {
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      promoTimeLeft.value[promo._id] = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    } else {
      promoTimeLeft.value[promo._id] = 'Expired'
    }
  })
  highlightedCoupons.value.forEach(coupon => {
    const end = new Date(coupon.endDate).getTime()
    const diff = Math.floor((end - now) / 1000)
    if (diff > 0) {
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      couponTimeLeft.value[coupon._id] = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    } else {
      couponTimeLeft.value[coupon._id] = 'Expired'
    }
  })
}

// Flash sale timer
const flashRemaining = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

const flashTimer = computed(() => {
  const h = Math.floor(flashRemaining.value / 3600)
  const m = Math.floor((flashRemaining.value % 3600) / 60)
  const s = flashRemaining.value % 60
  return {
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0'),
  }
})

// Navigation
function goToCategory(id: string) { router.push(`/category/${id}`) }
function goToSearchPromotion() { router.push('/search?sort=discount') }
function goToCoupon(id: string) { router.push(`/coupons/${id}`) }

// Fetch functions
async function fetchCategories() {
  try { const data: any = await api.get('/categories'); categories.value = data.categories || [] }
  catch { categoriesError.value = 'Failed to load categories' }
}

async function fetchFlashSale() {
  try {
    const data: any = await api.get('/products/flash-sale')
    flashSaleProducts.value = data.products || []
    if (data.endTime) { const end = new Date(data.endTime).getTime(); const now = new Date().getTime(); const diff = Math.floor((end - now) / 1000); flashRemaining.value = diff > 0 ? diff : 0 }
  } catch { flashError.value = 'Failed to load flash sale' }
}

async function fetchNewArrivals() {
  try { const data: any = await api.get('/products/new-arrivals'); newArrivals.value = data.products || [] }
  catch { arrivalsError.value = 'Failed to load new arrivals' }
}

async function fetchHeroSlides() {
  try { const data: any = await api.get('/hero-slides'); heroSlides.value = data.slides || [] }
  catch { heroSlidesError.value = 'Failed to load hero slides' }
}

async function fetchActivePromotions() {
  try { const data: any = await api.get('/promotions/active'); activePromotions.value = data.promotions || []; if (activePromotions.value.length > 0) updatePromoTimers() }
  catch { promotionsError.value = 'Failed to load promotions' }
}

async function fetchHighlightedCoupons() {
  try { const data: any = await api.get('/coupons/highlighted'); highlightedCoupons.value = data.coupons || [] }
  catch { /* silent */ }
}

let heroSlideInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchCategories(), fetchFlashSale(), fetchNewArrivals(), fetchHeroSlides(), fetchActivePromotions(), fetchHighlightedCoupons()])
  loading.value = false

  timerInterval = setInterval(() => { if (flashRemaining.value > 0) flashRemaining.value-- }, 1000)
  if (activePromotions.value.length > 0) { promoInterval = setInterval(() => { updatePromoTimers() }, 1000) }
  if (heroSlides.value.length > 1) { heroSlideInterval = setInterval(() => { currentHeroSlide.value = (currentHeroSlide.value + 1) % heroSlides.value.length }, 5000) }
})

onUnmounted(() => {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  if (promoInterval) { clearInterval(promoInterval); promoInterval = null }
  if (heroSlideInterval) { clearInterval(heroSlideInterval); heroSlideInterval = null }
})
</script>
