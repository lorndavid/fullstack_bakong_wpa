import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
  },
  {
    path: '/',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
      { path: 'products', name: 'products', component: () => import('@/pages/ProductsPage.vue') },
      { path: 'promotions', name: 'promotions', component: () => import('@/pages/PromotionsPage.vue') },
      { path: 'categories', name: 'categories', component: () => import('@/pages/CategoriesPage.vue') },
      { path: 'orders', name: 'orders', component: () => import('@/pages/OrdersPage.vue') },
      { path: 'users', name: 'users', component: () => import('@/pages/UsersPage.vue') },
      { path: 'users/:id', name: 'user-detail', component: () => import('@/pages/UserDetailPage.vue') },
      { path: 'roles', name: 'roles', component: () => import('@/pages/RolesPage.vue') },
      { path: 'transactions', name: 'transactions', component: () => import('@/pages/TransactionsPage.vue') },
      { path: 'hero-slides', name: 'hero-slides', component: () => import('@/pages/HeroSlidesPage.vue') },
      { path: 'payway-gateway', name: 'payway-gateway', component: () => import('@/pages/PaywayGatewayPage.vue') },
      { path: 'settings', name: 'settings', component: () => import('@/pages/SettingsPage.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
