import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import viteConfig from './vite.config'

// Use import.meta.url for ESM
const __dirname = resolve(new URL(import.meta.url).pathname)

export default defineConfig({
  ...viteConfig,
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.ts', '**/unit/**/*.spec.ts'],
    exclude: ['**/e2e/**', '**/node_modules/**', '**/dist/**'],
  },
})
