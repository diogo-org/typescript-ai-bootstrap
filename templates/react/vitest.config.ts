import { defineConfig } from 'vitest/config';

// Vitest configuration for React projects
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test.setup.ts'],
    testTimeout: 30000,
  },
});
