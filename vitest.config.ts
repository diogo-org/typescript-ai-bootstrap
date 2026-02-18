import { defineConfig } from 'vitest/config';

// Vitest configuration for Node.js CLI tool
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test.setup.ts'],
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.test.ts',
        '**/*.config.*',
        '**/test.setup.ts',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
});
