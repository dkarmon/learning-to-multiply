// ABOUTME: Vitest config for Firebase emulator tests.
// ABOUTME: Runs security rules tests against the local Firestore emulator.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.rules.test.ts'],
    testTimeout: 30000,
    reporters: ['verbose'],
  },
});
