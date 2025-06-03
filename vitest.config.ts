import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig({
  ...viteConfig,
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.ts', '**/unit/**/*.spec.ts'],
    exclude: ['**/e2e/**', '**/node_modules/**', '**/dist/**'],
  },
})
