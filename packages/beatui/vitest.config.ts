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
    // Use forks pool for better test isolation (vmThreads can cause mock leakage)
    pool: 'forks',
    server: {
      deps: {
        // Inline ES Module packages that are shipped in CommonJS format
        inline: ['@exodus/bytes'],
      },
    },
  },
})
