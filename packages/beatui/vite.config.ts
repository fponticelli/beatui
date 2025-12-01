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
        markdown: resolve(__dirname, 'src/markdown/index.ts'),
        prosemirror: resolve(__dirname, 'src/prosemirror/index.ts'),
        tailwind: resolve(__dirname, 'src/tailwind/index.ts'),
        'tailwind/preset': resolve(__dirname, 'src/tailwind/preset.ts'),
        'tailwind/vite-plugin': resolve(
          __dirname,
          'src/tailwind/vite-plugin.ts'
        ),
      },
      name: 'BeatUIFramework',
      fileName: (format, entryName) => {
        if (
          entryName === 'auth' ||
          entryName === 'json-schema' ||
          entryName === 'monaco' ||
          entryName === 'markdown' ||
          entryName === 'prosemirror' ||
          entryName === 'tailwind'
        ) {
          return `${entryName}/index.${format}.js`
        }
        if (entryName.startsWith('tailwind/')) {
          return `${entryName}.${format}.js`
        }
        return `${entryName}.${format}.js`
      },
    },
    rollupOptions: {
      external: (id, _parentId) => {
        // Always externalize these core dependencies
        const alwaysExternal = [
          '@tempots/dom',
          '@tempots/ui',
          'tailwindcss',
          'tailwindcss/plugin',
          'fs',
          'node:fs',
          'fs/promises',
          'node:fs/promises',
          'path',
          'node:path',
          'crypto',
          'node:crypto',
          'module',
          'node:module',
          'url',
          'node:url',
        ]

        if (alwaysExternal.includes(id)) {
          return true
        }

        // Bundle ProseMirror packages into the prosemirror entry
        // (don't externalize them)
        if (id.startsWith('prosemirror-')) {
          return false
        }

        // For all other dependencies, use default behavior
        // (externalize dependencies, bundle devDependencies)
        return undefined
      },
      output: {
        exports: 'named',
        globals: {
          '@tempots/dom': 'TempoDom',
          '@tempots/ui': 'TempoUI',
        },
      },
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
