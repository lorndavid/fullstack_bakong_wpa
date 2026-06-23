import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useAuthStore } from '@/stores/auth'
import './assets/main.css'

// Set html lang attribute for font styling
const savedLocale = localStorage.getItem('locale') || 'en'
document.documentElement.lang = savedLocale

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')

// Restore auth session from storage after mount
const authStore = useAuthStore()
authStore.loadFromStorage()
if (authStore.accessToken) {
  authStore.fetchMe()
}
