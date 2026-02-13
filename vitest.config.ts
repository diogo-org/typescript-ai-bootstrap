import { defineConfig } from 'vitest/config';

// Vitest configuration for Node.js CLI tool
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
  },
});
