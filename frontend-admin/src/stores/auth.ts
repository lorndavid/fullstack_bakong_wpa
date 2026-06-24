import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AdminUser | null>(JSON.parse(localStorage.getItem('admin_user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('admin_token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const data: any = await api.post('/auth/login', { email, password })
      if (data.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access only')
      }
      user.value = data.user
      token.value = data.token
      localStorage.setItem('admin_user', JSON.stringify(data.user))
      localStorage.setItem('admin_token', data.token)
      return data
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_token')
  }

  return { user, token, loading, isAuthenticated, isAdmin, login, logout }
})
