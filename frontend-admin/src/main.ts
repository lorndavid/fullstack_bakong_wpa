import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Init theme
const isDark = localStorage.getItem('theme') === 'dark'
if (isDark) {
  document.documentElement.classList.add('dark')
}

app.mount('#app')
