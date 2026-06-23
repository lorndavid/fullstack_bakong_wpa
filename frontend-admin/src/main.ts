import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/main.css'

// Set html lang attribute for font styling
const savedLocale = localStorage.getItem('locale') || 'en'
document.documentElement.lang = savedLocale

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// Init theme
const isDark = localStorage.getItem('theme') === 'dark'
if (isDark) {
  document.documentElement.classList.add('dark')
}

app.mount('#app')
