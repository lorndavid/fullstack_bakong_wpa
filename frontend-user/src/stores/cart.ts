import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

interface Promotion {
  _id: string
  name: string
  description: string
  discountPercent: number
  selectedProducts: string[]
  selectedCategories: string[]
  applyToAll: boolean
  startDate: string
  endDate: string
}

interface CartItem {
  productId: string
  name: string
  price: number
  originalPrice: number
  image: string
  quantity: number
  stock: number
  discount: number
  category: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(JSON.parse(localStorage.getItem('cart') || '[]'))
  const activePromotions = ref<Promotion[]>([])

  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))

  const shipping = computed(() => 0)

  function getItemPromotion(item: CartItem): Promotion | null {
    if (!activePromotions.value.length) return null
    for (const promo of activePromotions.value) {
      if (promo.applyToAll) return promo
      if (promo.selectedProducts?.includes(item.productId)) return promo
      if (item.category && promo.selectedCategories?.includes(item.category)) return promo
    }
    return null
  }

  function getItemEffectivePrice(item: CartItem): { basePrice: number; promoPrice: number | null; promoPercent: number } {
    const promo = getItemPromotion(item)
    if (!promo) {
      return { basePrice: item.price, promoPrice: null, promoPercent: 0 }
    }
    const promoPrice = item.price * (1 - promo.discountPercent / 100)
    return { basePrice: item.price, promoPrice, promoPercent: promo.discountPercent }
  }

  const promotionSavings = computed(() => {
    return items.value.reduce((sum, item) => {
      const { basePrice, promoPrice } = getItemEffectivePrice(item)
      if (promoPrice === null) return sum
      return sum + (basePrice - promoPrice) * item.quantity
    }, 0)
  })

  const appliedPromotions = computed(() => {
    const seen = new Set<string>()
    const result: { promotionId: string; name: string; discountPercent: number }[] = []
    for (const item of items.value) {
      const promo = getItemPromotion(item)
      if (promo && !seen.has(promo._id)) {
        seen.add(promo._id)
        result.push({
          promotionId: promo._id,
          name: promo.name,
          discountPercent: promo.discountPercent,
        })
      }
    }
    return result
  })

  const total = computed(() => {
    const promoSubtotal = items.value.reduce((sum, item) => {
      const { basePrice, promoPrice } = getItemEffectivePrice(item)
      const effectivePrice = promoPrice !== null ? promoPrice : basePrice
      return sum + effectivePrice * item.quantity
    }, 0)
    return promoSubtotal + shipping.value
  })

  async function fetchPromotions() {
    try {
      const res: any = await api.get('/promotions/active')
      activePromotions.value = res.promotions || []
    } catch {}
  }

  function persist() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  function addItem(product: { _id: string; name: string; price: number; discount: number; images: { secure_url: string }[]; stock: number; category?: { _id: string } | string }, quantity = 1) {
    const existing = items.value.find(i => i.productId === product._id)
    const discountPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price
    const categoryId = product.category
      ? (typeof product.category === 'object' ? product.category._id : product.category)
      : ''

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock)
    } else {
      items.value.push({
        productId: product._id,
        name: product.name,
        price: discountPrice,
        originalPrice: product.price,
        image: product.images[0]?.secure_url || '',
        quantity: Math.min(quantity, product.stock),
        stock: product.stock,
        discount: product.discount,
        category: categoryId,
      })
    }
    persist()
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find(i => i.productId === productId)
    if (item) {
      item.quantity = Math.max(1, Math.min(quantity, item.stock))
      persist()
    }
  }

  function removeItem(productId: string) {
    items.value = items.value.filter(i => i.productId !== productId)
    persist()
  }

  function clearCart() {
    items.value = []
    persist()
  }

  return {
    items,
    totalItems,
    subtotal,
    shipping,
    total,
    promotionSavings,
    appliedPromotions,
    activePromotions,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    fetchPromotions,
    getItemPromotion,
    getItemEffectivePrice,
  }
})
