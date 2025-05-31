import { defineConfig } from 'vite'
import { dirname, resolve } from 'path'

// Use import.meta.url for ESM
const __dirname = dirname(new URL(import.meta.url).pathname)

// Create a merged configuration for Vite and Vitest
export default defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TempoUIFramework',
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['@tempots/dom', '@tempots/ui'],
      output: {
        globals: {
          '@tempots/dom': 'TempoDom',
          '@tempots/ui': 'TempoUI',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Vitest configuration
  define: {
    'import.meta.vitest': 'undefined',
  },
})
