import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

interface User {
  _id: string
  googleId: string
  name: string
  email: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshTokenValue = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  function setAuth(userData: User, access: string, refresh: string) {
    user.value = userData
    accessToken.value = access
    refreshTokenValue.value = refresh
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
    error.value = null
  }

  function loadFromStorage() {
    const storedUser = localStorage.getItem('user')
    const storedAccess = localStorage.getItem('accessToken')
    const storedRefresh = localStorage.getItem('refreshToken')
    if (storedUser && storedAccess && storedRefresh) {
      user.value = JSON.parse(storedUser)
      accessToken.value = storedAccess
      refreshTokenValue.value = storedRefresh
    }
  }

  async function googleLogin(credential: string) {
    loading.value = true
    error.value = null
    try {
      const data: any = await api.post('/auth/google', { credential })
      setAuth(data.user, data.accessToken, data.refreshToken)
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
      return data
    } catch {
      // Token expired or invalid, try refresh
      const refreshed = await attemptRefresh()
      if (!refreshed) {
        logout()
      }
    }
  }

  async function attemptRefresh(): Promise<boolean> {
    const refresh = localStorage.getItem('refreshToken')
    if (!refresh) return false

    try {
      const data: any = await api.post('/auth/refresh', { refreshToken: refresh })
      accessToken.value = data.accessToken
      refreshTokenValue.value = data.refreshToken
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      return true
    } catch {
      return false
    }
  }

  function logout() {
    // Attempt to notify backend (fire and forget)
    if (accessToken.value) {
      api.post('/auth/logout').catch(() => {})
    }
    user.value = null
    accessToken.value = null
    refreshTokenValue.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  return {
    user,
    accessToken,
    refreshToken: refreshTokenValue,
    loading,
    error,
    isAuthenticated,
    googleLogin,
    fetchMe,
    attemptRefresh,
    logout,
    loadFromStorage,
  }
})
