import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.{png,svg,ico}', '*.{woff2,woff}'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,json}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
        runtimeCaching: [
          // ── App Shell (Cache First) ─────────────
          {
            urlPattern: /^https?:\/\/.*\/.*\.(?:js|css|html|json)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-shell',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Product Images (StaleWhileRevalidate) ─
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'product-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Categories (Cache First) ────────────
          {
            urlPattern: /\/api\/categories/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'categories',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Home Banner / Hero Slides (StaleWhileRevalidate) ─
          {
            urlPattern: /\/api\/hero-slides/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'home-banner',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Products list (StaleWhileRevalidate) ──
          {
            urlPattern: /\/api\/products/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'products',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 2 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Product Details (Network First) ──────
          {
            urlPattern: /\/api\/products\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'product-details',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 4 },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Settings (Cache First) ───────────────
          {
            urlPattern: /\/api\/settings/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'settings',
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Promotions active (StaleWhileRevalidate) ─
          {
            urlPattern: /\/api\/promotions\/active/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'promotions',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Coupons highlighted (StaleWhileRevalidate) ─
          {
            urlPattern: /\/api\/coupons\/highlighted/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'coupons',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // ── Flash Sale (StaleWhileRevalidate) ────
          {
            urlPattern: /\/api\/products\/flash-sale/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'flash-sale',
              expiration: { maxEntries: 3, maxAgeSeconds: 60 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'MY SHOP - Premium Cambodian E-commerce',
        short_name: 'MY SHOP',
        description: 'Premium shopping experience in Cambodia - Skincare, Beauty & More',
        theme_color: '#10B981',
        background_color: '#FFFFFF',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'browser'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        id: '/',
        lang: 'en',
        dir: 'ltr',
        categories: ['shopping', 'lifestyle', 'beauty'],
        screenshots: [],
        prefer_related_applications: false,
        iarc_rating_id: '',
        shortcuts: [
          {
            name: 'Search Products',
            short_name: 'Search',
            description: 'Search for products',
            url: '/search',
            icons: [{ src: 'icons/shortcut-search.png', sizes: '96x96' }],
          },
          {
            name: 'Shopping Cart',
            short_name: 'Cart',
            description: 'View your shopping cart',
            url: '/cart',
            icons: [{ src: 'icons/shortcut-cart.png', sizes: '96x96' }],
          },
          {
            name: 'My Wishlist',
            short_name: 'Wishlist',
            description: 'View your wishlist',
            url: '/profile?tab=wishlist',
            icons: [{ src: 'icons/shortcut-wishlist.png', sizes: '96x96' }],
          },
          {
            name: 'Flash Sale',
            short_name: 'Sale',
            description: 'Check today\'s flash deals',
            url: '/search?sort=discount',
            icons: [{ src: 'icons/shortcut-sale.png', sizes: '96x96' }],
          },
          {
            name: 'My Orders',
            short_name: 'Orders',
            description: 'Track your orders',
            url: '/orders',
            icons: [{ src: 'icons/shortcut-orders.png', sizes: '96x96' }],
          },
          {
            name: 'My Coupons',
            short_name: 'Coupons',
            description: 'View available coupons',
            url: '/coupons',
            icons: [{ src: 'icons/shortcut-coupon.png', sizes: '96x96' }],
          },
        ],
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
})
