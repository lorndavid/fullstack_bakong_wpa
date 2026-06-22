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
      { path: 'categories', name: 'categories', component: () => import('@/pages/CategoriesPage.vue') },
      { path: 'orders', name: 'orders', component: () => import('@/pages/OrdersPage.vue') },
      { path: 'users', name: 'users', component: () => import('@/pages/UsersPage.vue') },
      { path: 'transactions', name: 'transactions', component: () => import('@/pages/TransactionsPage.vue') },
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
