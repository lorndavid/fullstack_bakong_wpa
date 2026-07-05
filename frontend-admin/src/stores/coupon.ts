import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export interface Coupon {
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
  status: 'active' | 'inactive' | 'expired'
  applicableProducts: any[]
  applicableCategories: any[]
  excludedProducts: any[]
  excludedCategories: any[]
  applicableUsers: any[]
  newCustomerOnly: boolean
  firstOrderOnly: boolean
  allowGuest: boolean
  stackable: boolean
  priority: number
  autoApply: boolean
  bannerImage?: { public_id: string; secure_url: string }
  themeColor: string
  isHighlighted: boolean
  createdBy: { _id: string; name: string; email: string }
  createdAt: string
  updatedAt: string
}

export interface CouponAnalytics {
  totalCoupons: number
  activeCoupons: number
  expiredCoupons: number
  totalUsed: number
  avgUsage: number
  totalOrdersWithCoupon: number
  conversionRate: string
  redemptionRate: string
  mostUsedCoupons: { _id: string; name: string; code: string; usedCount: number; discountValue: number; discountType: string }[]
  dailyRedemption: { _id: string; count: number; revenue: number; discount: number }[]
  couponPerformance: Coupon[]
}

export const useCouponStore = defineStore('coupon', () => {
  const coupons = ref<Coupon[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const pages = ref(1)
  const page = ref(1)
  const analytics = ref<CouponAnalytics | null>(null)
  const analyticsLoading = ref(false)

  async function fetchCoupons(p = 1, filters: Record<string, any> = {}) {
    loading.value = true
    error.value = null
    try {
      page.value = p
      const params: any = { page: p, limit: 20, ...filters }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.discountType) params.discountType = filters.discountType
      if (filters.sort) params.sort = filters.sort
      const data: any = await api.get('/coupons/admin/all', { params })
      coupons.value = data.coupons || []
      total.value = data.pagination?.total || 0
      pages.value = data.pagination?.pages || 1
    } catch (err: any) {
      error.value = err.message || 'Failed to load coupons'
    } finally {
      loading.value = false
    }
  }

  async function fetchCoupon(id: string): Promise<Coupon | null> {
    try {
      const data: any = await api.get(`/coupons/admin/${id}`)
      return data.coupon
    } catch {
      return null
    }
  }

  async function createCoupon(formData: FormData): Promise<{ success: boolean; message: string }> {
    try {
      await api.post('/coupons/admin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return { success: true, message: 'Coupon created successfully' }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to create coupon' }
    }
  }

  async function updateCoupon(id: string, formData: FormData): Promise<{ success: boolean; message: string }> {
    try {
      await api.put(`/coupons/admin/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return { success: true, message: 'Coupon updated successfully' }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update coupon' }
    }
  }

  async function deleteCoupon(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await api.delete(`/coupons/admin/${id}`)
      return { success: true, message: 'Coupon deleted' }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to delete coupon' }
    }
  }

  async function updateCouponStatus(id: string, status: string): Promise<{ success: boolean; message: string }> {
    try {
      await api.patch(`/coupons/admin/${id}/status`, { status })
      return { success: true, message: 'Status updated' }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update status' }
    }
  }

  async function fetchAnalytics() {
    analyticsLoading.value = true
    try {
      const data: any = await api.get('/coupons/admin/analytics')
      analytics.value = data.analytics
    } catch {
      // silent
    } finally {
      analyticsLoading.value = false
    }
  }

  async function fetchSingleCouponAnalytics(id: string): Promise<any> {
    try {
      const data: any = await api.get(`/coupons/admin/${id}/analytics`)
      return data.analytics
    } catch {
      return null
    }
  }

  return {
    coupons,
    loading,
    error,
    total,
    pages,
    page,
    analytics,
    analyticsLoading,
    fetchCoupons,
    fetchCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    updateCouponStatus,
    fetchAnalytics,
    fetchSingleCouponAnalytics,
  }
})
