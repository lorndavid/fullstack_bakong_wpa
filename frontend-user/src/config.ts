/**
 * Application configuration
 *
 * VITE_* env vars are statically replaced at build time.
 * If the env var is missing during the Vercel build, the fallback value is used.
 * The Google Client ID is NOT a secret — it is always exposed in the browser.
 */

export const GOOGLE_CLIENT_ID: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '1083522713079-jlrifkkrlg2jeb6s0rrb8vii3hnvrgsk.apps.googleusercontent.com'
