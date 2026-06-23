import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface CartItem {
  productId: string
  name: string
  price: number
  originalPrice: number
  image: string
  quantity: number
  stock: number
  discount: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(JSON.parse(localStorage.getItem('cart') || '[]'))
  const coupon = ref<string | null>(null)
  const discountAmount = ref(0)

  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))

  const shipping = computed(() => 0)

  const total = computed(() => subtotal.value + shipping.value - discountAmount.value)

  function persist() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  function addItem(product: { _id: string; name: string; price: number; discount: number; images: { secure_url: string }[]; stock: number }, quantity = 1) {
    const existing = items.value.find(i => i.productId === product._id)
    const discountPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price

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
    coupon.value = null
    discountAmount.value = 0
    persist()
  }

  function applyCoupon(code: string) {
    // Mock coupon logic - in production, validate against backend
    if (code === 'SAVE10') {
      coupon.value = code
      discountAmount.value = subtotal.value * 0.1
      return true
    }
    return false
  }

  function removeCoupon() {
    coupon.value = null
    discountAmount.value = 0
  }

  return {
    items,
    coupon,
    discountAmount,
    totalItems,
    subtotal,
    shipping,
    total,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  }
})
