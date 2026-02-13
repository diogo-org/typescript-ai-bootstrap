import { defineConfig } from 'vitest/config';

// Vitest configuration for TypeScript projects
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test.setup.ts'],
    testTimeout: 30000,
  },
});
