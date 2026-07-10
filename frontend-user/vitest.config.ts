import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// ──────────────────────────────────────────────────────────────
// Vitest Configuration — User Frontend
// ──────────────────────────────────────────────────────────────
// Uses the same Vite config for consistency.
// Tests run in jsdom environment (simulated browser).
//
// Test files: src/**/*.test.ts or src/**/*.spec.ts
// ──────────────────────────────────────────────────────────────

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  test: {
    // Simulates browser environment for Vue component tests
    environment: 'jsdom',

    // Global test utilities (describe, it, expect) available without import
    globals: true,

    // Include test files
    include: ['src/**/*.{test,spec}.{ts,js}'],

    // Exclude integration/e2e tests
    exclude: ['node_modules', 'dist'],

    // Code coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.ts', 'src/main.ts'],
    },

    // Timeout per test
    testTimeout: 10000,
  },
});
