import { defineConfig } from 'vite'

// Vite configuration for TypeScript Node projects
export default defineConfig({
  base: process.env.CI ? '/{{PROJECT_NAME}}/' : '/',
  build: {
    target: 'node18',
    lib: {
      entry: 'src/main.ts',
      formats: ['es'],
      fileName: () => 'main.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})
