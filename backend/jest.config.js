// ──────────────────────────────────────────────────────────────
// Jest Configuration — Backend Unit Tests
// ──────────────────────────────────────────────────────────────
// Uses ts-jest to compile TypeScript on-the-fly during tests.
// Tests run in a Node.js environment (no DOM).
//
// Test files: src/**/__tests__/*.test.ts
// ──────────────────────────────────────────────────────────────

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Where to find tests
  roots: ['<rootDir>/src'],

  // Test file naming pattern
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts',
  ],

  // Module path aliases (mirrors tsconfig paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Code coverage
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/seed*.ts',
    '!src/clear-*.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 0,    // No threshold yet — add as tests grow
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },

  // Verbose output in CI
  verbose: true,

  // Timeout for async tests (30 seconds)
  testTimeout: 30000,
};
