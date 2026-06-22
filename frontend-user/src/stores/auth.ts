import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setAuth(userData: User, tokenValue: string) {
    user.value = userData
    token.value = tokenValue
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', tokenValue)
    error.value = null
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const data: any = await api.post('/auth/login', { email, password })
      setAuth(data.user, data.token)
      return data
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(name: string, email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const data: any = await api.post('/auth/register', { name, email, password })
      setAuth(data.user, data.token)
      return data
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function googleLogin(googleData: { email: string; name: string; googleId: string; avatar?: string }) {
    loading.value = true
    error.value = null
    try {
      const data: any = await api.post('/auth/google', googleData)
      setAuth(data.user, data.token)
      return data
    } catch (err: any) {
      error.value = err.message || 'Google login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    try {
      const data: any = await api.get('/auth/me')
      user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch {
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    googleLogin,
    fetchMe,
    logout,
  }
})
