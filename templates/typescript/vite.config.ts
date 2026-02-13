import { defineConfig } from 'vite'

// Generic Vite configuration for TypeScript projects
export default defineConfig({
  base: process.env.CI ? '/{{PROJECT_NAME}}/' : '/',
})
