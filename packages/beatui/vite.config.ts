import { defineConfig } from 'vite'
import { dirname, resolve } from 'path'
import { generateCSSVariablesPlugin } from './scripts/vite-plugins'

// Use import.meta.url for ESM
const __dirname = dirname(new URL(import.meta.url).pathname)

// Create a merged configuration for Vite and Vitest
export default defineConfig({
  plugins: [generateCSSVariablesPlugin()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        auth: resolve(__dirname, 'src/auth/index.ts'),
        'json-schema': resolve(__dirname, 'src/json-schema/index.ts'),
        monaco: resolve(__dirname, 'src/monaco/index.ts'),
        milkdown: resolve(__dirname, 'src/milkdown/index.ts'),
        markdown: resolve(__dirname, 'src/markdown/index.ts'),
        tailwind: resolve(__dirname, 'src/tailwind/index.ts'),
      },
      name: 'BeatUIFramework',
      fileName: (format, entryName) => {
        if (
          entryName === 'auth' ||
          entryName === 'json-schema' ||
          entryName === 'monaco' ||
          entryName === 'milkdown' ||
          entryName === 'markdown' ||
          entryName === 'tailwind'
        ) {
          return `${entryName}/index.${format}.js`
        }
        return `${entryName}.${format}.js`
      },
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
  // Vitest configuration + harden defines for deps that expect Vue compile-time flags
  define: {
    'import.meta.vitest': 'undefined',
    __VUE_OPTIONS_API__: 'false',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
})
