import { defineConfig } from 'vitest/config';

// Vitest configuration for TypeScript projects
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
  },
});
