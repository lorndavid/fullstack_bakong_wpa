/**
 * API Base URL for Axios requests.
 * In development: '/api' (proxied by Vite dev server)
 * In production: 'https://api.lorndavid.online/api' (direct connection)
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

/**
 * Socket.IO server URL.
 * In development: '' (same origin, proxied by Vite)
 * In production: 'https://api.lorndavid.online' (direct WebSocket connection)
 *
 * Using a direct URL instead of Vercel rewrites ensures native WebSocket
 * transport works, avoiding the long-polling fallback that Vercel requires.
 */
export const SOCKET_URL = import.meta.env.VITE_API_URL || ''
