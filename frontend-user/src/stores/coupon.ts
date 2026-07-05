import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export interface CouponInfo {
  _id: string
  name: string
  code: string
  description: string
  discountType: 'percentage' | 'fixed' | 'free_shipping'
  discountValue: number
  minimumPurchase: number
  maximumDiscount: number
  startDate: string
  endDate: string
  usageLimit: number
  usedCount: number
  limitPerUser: number
  status: string
  applicableProducts: any[]
  applicableCategories: any[]
  excludedProducts: any[]
  excludedCategories: any[]
  newCustomerOnly: boolean
  firstOrderOnly: boolean
  allowGuest: boolean
  stackable: boolean
  priority: number
  autoApply: boolean
  userStatus: 'available' | 'used' | 'expired' | 'upcoming' | 'exhausted'
  bannerImage?: { public_id: string; secure_url: string }
  themeColor: string
  isHighlighted: boolean
}

export interface AppliedCoupon {
  _id: string
  name: string
  code: string
  discountType: string
  discountValue: number
  discountAmount: number
  maximumDiscount: number
  label: string
  themeColor: string
  stackable: boolean
}

export const useCouponStore = defineStore('userCoupon', () => {
  const available = ref<CouponInfo[]>([])
  const used = ref<CouponInfo[]>([])
  const expired = ref<CouponInfo[]>([])
  const upcoming = ref<CouponInfo[]>([])
  const loading = ref(false)
  const activeTab = ref<'available' | 'used' | 'expired' | 'upcoming'>('available')
  const appliedCoupon = ref<AppliedCoupon | null>(null)
  const autoApplyCoupons = ref<CouponInfo[]>([])
  const applying = ref(false)

  const tabCounts = computed(() => ({
    available: available.value.length,
    used: used.value.length,
    expired: expired.value.length,
    upcoming: upcoming.value.length,
  }))

  async function fetchCoupons() {
    loading.value = true
    try {
      const data: any = await api.get('/coupons/available')
      available.value = data.available || []
      used.value = data.used || []
      expired.value = data.expired || []
      upcoming.value = data.upcoming || []
    } catch {
      // silent
    } finally {
      loading.value = false
    }
  }

  async function validateCoupon(code: string, products: any[], subtotal: number): Promise<{ valid: boolean; coupon?: AppliedCoupon; message?: string; minimumPurchase?: number }> {
    try {
      const data: any = await api.post('/coupons/validate', { code, products, subtotal })
      if (data.valid && data.coupon) {
        return { valid: true, coupon: data.coupon }
      }
      return { valid: false, message: data.message, minimumPurchase: data.minimumPurchase }
    } catch {
      return { valid: false, message: 'Failed to validate coupon' }
    }
  }

  async function applyCoupon(code: string, products: any[], subtotal: number): Promise<{ success: boolean; coupon?: AppliedCoupon; discountAmount?: number; newTotal?: number; message?: string }> {
    applying.value = true
    try {
      const data: any = await api.post('/coupons/apply', { code, products, subtotal })
      if (data.valid) {
        appliedCoupon.value = data.coupon
        return { success: true, coupon: data.coupon, discountAmount: data.discountAmount, newTotal: data.newTotal }
      }
      return { success: false, message: data.message }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to apply coupon' }
    } finally {
      applying.value = false
    }
  }

  function removeCoupon() {
    appliedCoupon.value = null
  }

  async function fetchAutoApplyCoupons() {
    try {
      const data: any = await api.get('/coupons/auto-apply')
      autoApplyCoupons.value = data.coupons || []
    } catch {
      // silent
    }
  }

  return {
    available,
    used,
    expired,
    upcoming,
    loading,
    activeTab,
    appliedCoupon,
    autoApplyCoupons,
    applying,
    tabCounts,
    fetchCoupons,
    validateCoupon,
    applyCoupon,
    removeCoupon,
    fetchAutoApplyCoupons,
  }
})
