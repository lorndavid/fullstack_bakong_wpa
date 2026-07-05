import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { layout: 'default' },
  },
  {
    path: '/auth',
    redirect: '/auth/login',
    meta: { layout: 'auth' },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/auth/LoginPage.vue'),
      },
    ],
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: () => import('@/pages/product/ProductDetailPage.vue'),
    meta: { layout: 'default' },
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/pages/cart/CartPage.vue'),
    meta: { layout: 'default' },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/pages/checkout/CheckoutPage.vue'),
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/payment/:id',
    name: 'payment',
    component: () => import('@/pages/payment/PaymentPage.vue'),
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/pages/order/OrderListPage.vue'),
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/order/:id',
    name: 'order-detail',
    component: () => import('@/pages/order/OrderDetailPage.vue'),
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('@/pages/category/CategoryPage.vue'),
    meta: { layout: 'default' },
  },
  {
    path: '/category/:id',
    name: 'category-products',
    component: () => import('@/pages/category/CategoryProductsPage.vue'),
    meta: { layout: 'default' },
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/pages/search/SearchPage.vue'),
    meta: { layout: 'default' },
  },
  {
    path: '/coupons',
    name: 'coupons',
    component: () => import('@/pages/coupons/CouponCenterPage.vue'),
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/coupons/:id',
    name: 'coupon-detail',
    component: () => import('@/pages/coupons/CouponDetailPage.vue'),
    meta: { layout: 'default' },
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/pages/NotificationsPage.vue'),
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/profile/ProfilePage.vue'),
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { layout: 'default' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
