// ABOUTME: Test configuration for Vitest.
// ABOUTME: Separates unit/integration tests from E2E and Firebase emulator tests.

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/__tests__/**/*.test.ts', 'src/**/__tests__/**/*.test.tsx'],
    exclude: ['src/**/*.e2e.test.ts', 'src/**/*.rules.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/stores/**', 'src/hooks/**'],
      exclude: ['src/**/__tests__/**', 'src/test/**'],
      thresholds: {
        'src/lib/learning-engine/': {
          statements: 95,
          branches: 90,
        },
      },
    },
    reporters: ['verbose'],
    testTimeout: 10000,
  },
});
