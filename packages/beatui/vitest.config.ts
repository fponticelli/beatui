import { defineConfig } from 'vitest/config'
import { resolve, dirname } from 'path'

const __dirname = dirname(new URL(import.meta.url).pathname)

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    root: __dirname,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: ['**/e2e/**', '**/node_modules/**', '**/dist/**'],
    // Prefer a single thread to avoid tinypool termination issues in sandbox
    pool: 'vmThreads',
  },
})
