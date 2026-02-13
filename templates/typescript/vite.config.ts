import { defineConfig } from 'vite'

// Vite configuration for TypeScript Node projects
export default defineConfig({
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
