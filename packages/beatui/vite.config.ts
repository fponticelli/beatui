import { defineConfig, type Plugin } from 'vite'
import { dirname, resolve } from 'path'
import { generateCSSVariablesPlugin } from './scripts/vite-plugins'

// Use import.meta.url for ESM
const __dirname = dirname(new URL(import.meta.url).pathname)

/**
 * Rollup plugin that unwraps `new URL("data:...", import.meta.url).toString()`
 * into a plain string literal.
 *
 * Vite's asset inlining converts CSS imports into base64 data URIs but keeps the
 * `new URL(...)` wrapper. Consumer Vite builds then try to resolve the data URI
 * as a relative file path, causing ENAMETOOLONG or 404 errors.
 */
function unwrapDataUriPlugin(): Plugin {
  return {
    name: 'unwrap-data-uri',
    renderChunk(code) {
      // Unwrap `new URL("data:...", <base>).toString()` → `"data:..."`.
      // The base argument varies between ESM (`import.meta.url`) and CJS (a polyfill
      // with nested parentheses). Since data URIs are absolute, the base is irrelevant.
      // We use parenthesis balancing instead of a flat regex to handle the CJS case.
      const MARKER = 'new URL("data:'
      if (!code.includes(MARKER)) return null

      let result = code
      let searchFrom = 0
      let changed = false

      while (true) {
        const idx = result.indexOf(MARKER, searchFrom)
        if (idx === -1) break

        // Extract the data URI (base64 never contains unescaped double-quotes)
        const uriStart = idx + 'new URL("'.length
        const uriEnd = result.indexOf('"', uriStart)
        if (uriEnd === -1) break
        const dataUri = result.substring(uriStart, uriEnd)

        // Find the opening paren of new URL(
        let i = idx + 'new URL'.length
        // Balance parentheses to find the matching close
        let depth = 0
        for (; i < result.length; i++) {
          if (result[i] === '(') depth++
          else if (result[i] === ')') {
            depth--
            if (depth === 0) break
          }
        }

        // Check that .toString() follows immediately
        if (result.substring(i + 1, i + 12) === '.toString()') {
          const replacement = `"${dataUri}"`
          result =
            result.substring(0, idx) +
            replacement +
            result.substring(i + 12)
          searchFrom = idx + replacement.length
          changed = true
        } else {
          searchFrom = idx + MARKER.length
        }
      }

      return changed ? { code: result, map: null } : null
    },
  }
}

// Create a merged configuration for Vite and Vitest
export default defineConfig({
  plugins: [generateCSSVariablesPlugin(), unwrapDataUriPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/tailwind/**',
        'src/monaco/**',
        'src/prosemirror/**',
        'src/lexical/**',
        'src/better-auth/**',
        'src/markdown/**',
      ],
      thresholds: {
        // Set baseline thresholds - can be increased over time
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        auth: resolve(__dirname, 'src/auth/index.ts'),
        'json-schema': resolve(__dirname, 'src/json-schema/index.ts'),
        'json-schema-display': resolve(
          __dirname,
          'src/json-schema-display/index.ts'
        ),
        'json-structure': resolve(__dirname, 'src/json-structure/index.ts'),
        monaco: resolve(__dirname, 'src/monaco/index.ts'),
        markdown: resolve(__dirname, 'src/markdown/index.ts'),
        prosemirror: resolve(__dirname, 'src/prosemirror/index.ts'),
        lexical: resolve(__dirname, 'src/lexical/index.ts'),
        'better-auth': resolve(__dirname, 'src/better-auth/index.ts'),
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
          entryName === 'json-schema-display' ||
          entryName === 'json-structure' ||
          entryName === 'monaco' ||
          entryName === 'markdown' ||
          entryName === 'prosemirror' ||
          entryName === 'lexical' ||
          entryName === 'better-auth' ||
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

        // Externalize better-auth packages
        if (id === 'better-auth' || id.startsWith('better-auth/')) {
          return true
        }
        if (id.startsWith('@better-auth/')) {
          return true
        }

        // Bundle Lexical packages into the lexical entry
        // (don't externalize them)
        if (id === 'lexical' || id.startsWith('@lexical/')) {
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
