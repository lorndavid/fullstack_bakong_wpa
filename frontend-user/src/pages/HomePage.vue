<template>
  <div class="space-y-0 pb-16 sm:pb-0">
    <!-- ════════════════ 1. HERO SECTION ════════════════ -->
    <section class="relative h-[70vh] sm:h-[80vh] overflow-hidden bg-gradient-hero">
      <!-- Background Decorative Elements -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-[#FFD5E0]/30 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-[#C084FC]/20 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/3 w-60 h-60 bg-[#FF7AA2]/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
          <!-- Text Content -->
          <div class="animate-fade-in-up max-w-xl">
            <span class="badge-pink mb-4 inline-block">✨ New Collection</span>
            <h1 class="text-hero-sm sm:text-hero text-[#1A1A1A] mb-4">
              Reveal Your<br/>
              <span class="bg-gradient-to-r from-[#FF7AA2] to-[#C084FC] bg-clip-text text-transparent">Natural Glow</span>
            </h1>
            <p class="text-body text-[#666666] mb-8 leading-relaxed">
              Premium skincare curated for healthy, radiant skin. 
              Discover dermatologist-approved products that transform your daily routine into a luxury experience.
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <router-link to="/search" class="btn-primary text-base !px-8 !py-3.5">
                Shop Now
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </router-link>
              <router-link to="/categories" class="btn-secondary text-base !px-8 !py-3.5">
                Browse Categories
              </router-link>
            </div>
          </div>

          <!-- Hero Image / Decorative -->
          <div class="hidden lg:flex items-center justify-center relative">
            <div v-if="heroSlides.length > 0 && heroSlides[0]?.image" class="relative">
              <img :src="heroSlides[0].image.secure_url" alt="Skincare" 
                class="w-full max-w-md rounded-4xl shadow-elevated object-cover aspect-[4/5] animate-fade-in" />
              <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-white/80 backdrop-blur-xl rounded-2xl shadow-glass flex items-center justify-center">
                <div class="text-center">
                  <p class="text-2xl font-bold text-[#FF7AA2]">2.5K+</p>
                  <p class="text-[10px] text-[#666666]">Happy Customers</p>
                </div>
              </div>
              <div class="absolute -top-4 -right-4 w-20 h-20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-glass flex items-center justify-center">
                <div class="text-center">
                  <p class="text-xl font-bold text-[#C084FC]">⭐</p>
                  <p class="text-[10px] text-[#666666]">4.9 Rating</p>
                </div>
              </div>
            </div>
            <div v-else class="w-full max-w-md aspect-[4/5] rounded-4xl bg-gradient-to-br from-[#F8D7E3] to-[#FFE8ED] flex items-center justify-center">
              <div class="text-center">
                <div class="w-24 h-24 mx-auto mb-4 bg-white/60 rounded-full flex items-center justify-center animate-float">
                  <span class="text-5xl">✨</span>
                </div>
                <p class="text-[#FF7AA2] font-semibold">Premium Skincare</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <svg class="w-6 h-6 text-[#FF7AA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    </section>

    <!-- ════════════════ 2. FEATURED BENEFITS ════════════════ -->
    <section class="py-12 sm:py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div v-for="benefit in benefits" :key="benefit.title"
            class="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-[#FFF8FA] border border-[#F1E6EA] hover:shadow-card transition-all duration-300 group">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD5E0] to-[#FFF4F7] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <span class="text-2xl">{{ benefit.icon }}</span>
            </div>
            <h3 class="font-display font-semibold text-base text-[#1A1A1A] mb-1">{{ benefit.title }}</h3>
            <p class="text-body-sm text-[#666666]">{{ benefit.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════ 3. SHOP BY CATEGORY ════════════════ -->
    <section class="py-12 sm:py-16 bg-[#FFF8FA]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-10 sm:mb-12">
          <span class="badge-pink mb-3 inline-block">Categories</span>
          <h2 class="section-title">Shop by Category</h2>
          <p class="section-subtitle">Find exactly what your skin needs</p>
        </div>

        <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div v-for="i in 6" :key="i" class="skeleton aspect-[3/4] rounded-2xl"></div>
        </div>

        <div v-else-if="categories.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <router-link v-for="cat in categories" :key="cat._id" :to="`/category/${cat._id}`"
            class="group relative overflow-hidden rounded-2xl bg-white border border-[#F1E6EA] hover:shadow-card-hover transition-all duration-300">
            <div class="aspect-[3/4] p-6 flex flex-col items-center justify-center">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F8D7E3] to-[#FFF4F7] flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {{ cat.icon }}
              </div>
              <h3 class="font-display font-semibold text-sm text-[#1A1A1A] text-center">{{ cat.name }}</h3>
              <p class="text-xs text-[#C4A8B6] mt-1">Shop Now →</p>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- ════════════════ 4. BEST SELLERS ════════════════ -->
    <section class="py-12 sm:py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-end justify-between mb-10">
          <div>
            <span class="badge-pink mb-3 inline-block">Best Sellers</span>
            <h2 class="section-title">Customer Favorites</h2>
            <p class="section-subtitle mb-0">Most loved products by our community</p>
          </div>
          <router-link to="/search?sort=best-selling" class="btn-ghost text-sm hidden sm:inline-flex">
            View All →
          </router-link>
        </div>

        <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div v-for="i in 4" :key="i" class="skeleton aspect-[3/4] rounded-card"></div>
        </div>

        <div v-else-if="newArrivals.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div v-for="product in newArrivals.slice(0, 4)" :key="product._id"
            @click="goToProduct(product._id)"
            class="product-card cursor-pointer group">
            <div class="relative product-image aspect-square overflow-hidden bg-[#FFF8FA]">
              <img v-if="product.images?.[0]" :src="product.images[0].secure_url" :alt="product.name"
                class="w-full h-full object-cover" loading="lazy" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-4xl">✨</span>
              </div>
              <!-- Wishlist Button -->
              <button @click.stop class="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm hover:bg-white">
                <svg class="w-4 h-4 text-[#FF7AA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
              <!-- Discount Badge -->
              <div v-if="product.discount > 0" class="absolute top-3 left-3 px-2.5 py-1 bg-[#FF7AA2] text-white text-xs font-bold rounded-full shadow-sm">
                -{{ product.discount }}%
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-display font-semibold text-sm text-[#1A1A1A] truncate mb-1 group-hover:text-[#FF7AA2] transition-colors">
                {{ product.name }}
              </h3>
              <div class="flex items-center gap-1 mb-2">
                <svg v-for="s in 5" :key="s" class="w-3 h-3" :class="s <= Math.round(product.rating) ? 'text-amber-400' : 'text-[#F1E6EA]'" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span class="text-xs text-[#C4A8B6] ml-1">({{ product.numReviews || 0 }})</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-lg text-[#1A1A1A]">
                    ${{ product.discount > 0 ? (product.price * (1 - product.discount / 100)).toFixed(2) : product.price.toFixed(2) }}
                  </span>
                  <span v-if="product.discount > 0" class="text-sm text-[#C4A8B6] line-through">${{ product.price.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="newArrivals.length > 0" class="text-center mt-8 sm:hidden">
          <router-link to="/search?sort=best-selling" class="btn-secondary text-sm">
            View All Products →
          </router-link>
        </div>
      </div>
    </section>

    <!-- ════════════════ 5. SKINCARE ROUTINE ════════════════ -->
    <section class="py-12 sm:py-16 bg-[#FFF8FA]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-10 sm:mb-12">
          <span class="badge-pink mb-3 inline-block">Routine</span>
          <h2 class="section-title">Your Skincare Routine</h2>
          <p class="section-subtitle">Simple steps for a glowing complexion</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          <!-- Morning Routine -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-[#F1E6EA] shadow-card">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-gradient-to-br from-amber-200 to-amber-300 rounded-xl flex items-center justify-center">
                <span class="text-lg">☀️</span>
              </div>
              <h3 class="font-display font-semibold text-lg text-[#1A1A1A]">Morning Routine</h3>
            </div>
            <div class="space-y-4">
              <div v-for="(step, i) in morningRoutine" :key="i" class="flex items-start gap-4">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD5E0] to-[#FFE8ED] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-xs font-bold text-[#FF7AA2]">{{ i + 1 }}</span>
                </div>
                <div>
                  <h4 class="font-semibold text-sm text-[#1A1A1A]">{{ step.title }}</h4>
                  <p class="text-body-sm text-[#666666]">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Night Routine -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-[#F1E6EA] shadow-card">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-xl flex items-center justify-center">
                <span class="text-lg">🌙</span>
              </div>
              <h3 class="font-display font-semibold text-lg text-[#1A1A1A]">Night Routine</h3>
            </div>
            <div class="space-y-4">
              <div v-for="(step, i) in nightRoutine" :key="i" class="flex items-start gap-4">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#C084FC] to-[#DDD6FE] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-xs font-bold text-purple-600">{{ i + 1 }}</span>
                </div>
                <div>
                  <h4 class="font-semibold text-sm text-[#1A1A1A]">{{ step.title }}</h4>
                  <p class="text-body-sm text-[#666666]">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════ 6. CUSTOMER REVIEWS ════════════════ -->
    <section class="py-12 sm:py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-10 sm:mb-12">
          <span class="badge-pink mb-3 inline-block">Testimonials</span>
          <h2 class="section-title">What Our Customers Say</h2>
          <p class="section-subtitle">Real reviews from real skincare lovers</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(review, i) in reviews" :key="i"
            class="bg-[#FFF8FA] rounded-3xl p-6 sm:p-8 border border-[#F1E6EA] hover:shadow-card transition-all duration-300">
            <div class="flex items-center gap-1 mb-4">
              <svg v-for="s in 5" :key="s" class="w-4 h-4" :class="s <= review.rating ? 'text-amber-400' : 'text-[#F1E6EA]'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <p class="text-body-sm text-[#666666] leading-relaxed mb-5">"{{ review.text }}"</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br" :class="review.gradient">
                <div class="w-full h-full rounded-full flex items-center justify-center">
                  <span class="text-sm font-bold text-white">{{ review.name.charAt(0) }}</span>
                </div>
              </div>
              <div>
                <p class="text-sm font-semibold text-[#1A1A1A]">{{ review.name }}</p>
                <p class="text-xs text-[#C4A8B6]">{{ review.product }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════ 7. INSTAGRAM GALLERY ════════════════ -->
    <section class="py-12 sm:py-16 bg-[#FFF8FA]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-10">
          <span class="badge-pink mb-3 inline-block">@glowbeauty</span>
          <h2 class="section-title">Follow Us on Instagram</h2>
          <p class="section-subtitle">Tag us for a chance to be featured</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div v-for="(item, i) in gallery" :key="i"
            class="aspect-square rounded-2xl overflow-hidden group cursor-pointer relative bg-gradient-to-br"
            :class="item.bg">
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">{{ item.emoji }}</span>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <div class="flex items-center gap-1 text-white">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>
                <span class="text-xs font-medium">{{ item.likes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════ NEWSLETTER ════════════════ -->
    <section class="py-16 sm:py-20 bg-gradient-soft">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <div class="max-w-lg mx-auto">
          <span class="text-4xl mb-4 block">💌</span>
          <h2 class="section-title">Join Our Glow Community</h2>
          <p class="section-subtitle">Subscribe for exclusive offers, skincare tips, and early access to new products.</p>
          <div class="flex gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email"
              class="input-beauty flex-1" />
            <button class="btn-primary !px-6 whitespace-nowrap">Subscribe</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

interface Category { _id: string; name: string; icon: string }
interface Product { _id: string; name: string; price: number; stock: number; discount: number; images: { secure_url: string }[]; rating: number; numReviews: number; sold: number; createdAt: string }

const router = useRouter()
const categories = ref<Category[]>([])
const newArrivals = ref<Product[]>([])
const heroSlides = ref<any[]>([])
const loading = ref(true)

const benefits = [
  { icon: '✅', title: '100% Authentic', desc: 'Guaranteed genuine products' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Free shipping on all orders' },
  { icon: '🔬', title: 'Dermatologist Approved', desc: 'Safe for all skin types' },
  { icon: '🔒', title: 'Secure Checkout', desc: 'Protected payments' },
]

const morningRoutine = [
  { title: 'Cleanser', desc: 'Start with a gentle, hydrating cleanser to remove impurities' },
  { title: 'Toner', desc: 'Balance your skin\'s pH with a alcohol-free toner' },
  { title: 'Serum', desc: 'Apply vitamin C serum for brightening and protection' },
  { title: 'Moisturizer', desc: 'Lock in hydration with a lightweight moisturizer' },
  { title: 'Sunscreen', desc: 'Finish with SPF 50+ for essential sun protection' },
]

const nightRoutine = [
  { title: 'Oil Cleanser', desc: 'Remove makeup and sunscreen with an oil-based cleanser' },
  { title: 'Water Cleanser', desc: 'Double cleanse with a gentle water-based cleanser' },
  { title: 'Exfoliate', desc: 'Use gentle exfoliant (2-3 times per week)' },
  { title: 'Serum', desc: 'Apply retinol or peptide serum for overnight repair' },
  { title: 'Night Cream', desc: 'Deeply hydrate with a rich night cream' },
]

const reviews = [
  { name: 'Sophia L.', text: 'My skin has never looked better! The serum transformed my complexion in just two weeks.', rating: 5, product: 'Vitamin C Serum', gradient: 'from-[#FF7AA2] to-[#C084FC]' },
  { name: 'Emma C.', text: 'Absolutely love the moisturizer. It\'s lightweight but so hydrating. Perfect for my sensitive skin.', rating: 5, product: 'Daily Moisturizer', gradient: 'from-[#C084FC] to-[#FF7AA2]' },
  { name: 'Maya K.', text: 'The customer service is amazing and the products are top quality. Will definitely be a returning customer!', rating: 5, product: 'Skincare Set', gradient: 'from-[#F8D7E3] to-[#FF7AA2]' },
]

const gallery = [
  { emoji: '✨', bg: 'from-[#F8D7E3] to-[#FFE8ED]', likes: '2.4K' },
  { emoji: '🌸', bg: 'from-[#FFD5E0] to-[#FFF4F7]', likes: '1.8K' },
  { emoji: '🌿', bg: 'from-[#E6FFE6] to-[#FFF8FA]', likes: '3.1K' },
  { emoji: '💫', bg: 'from-[#DDD6FE] to-[#F5F3FF]', likes: '2.7K' },
  { emoji: '🧴', bg: 'from-[#FFE8ED] to-[#FFF4F7]', likes: '1.5K' },
  { emoji: '🌟', bg: 'from-[#FEF3C7] to-[#FFFBEB]', likes: '4.2K' },
]

function goToProduct(id: string) { router.push(`/product/${id}`) }

onMounted(async () => {
  loading.value = true
  try {
    const [catData, prodData, slideData] = await Promise.all([
      api.get('/categories'),
      api.get('/products?limit=8&sort=newest'),
      api.get('/hero-slides'),
    ])
    categories.value = (catData as any).categories || []
    newArrivals.value = (prodData as any).products || []
    heroSlides.value = (slideData as any).slides || []
  } catch (err) { console.error(err) }
  loading.value = false
})
</script>
