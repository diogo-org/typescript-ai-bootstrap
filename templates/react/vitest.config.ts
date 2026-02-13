import { defineConfig } from 'vitest/config';

// Vitest configuration for React projects
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    testTimeout: 30000,
  },
});
