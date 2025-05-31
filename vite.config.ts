import { defineConfig } from 'vite'
import { dirname, resolve } from 'path'
import { spawn } from 'child_process'

// Use import.meta.url for ESM
const __dirname = dirname(new URL(import.meta.url).pathname)

// Vite plugin to generate CSS variables before build
function generateCSSVariablesPlugin() {
  return {
    name: 'generate-css-variables',
    buildStart: async () => {
      console.log('🎨 Generating CSS variables from design tokens...')

      try {
        await new Promise((resolve, reject) => {
          const child = spawn('tsx', ['scripts/generate-css-variables.ts'], {
            stdio: 'inherit',
            cwd: process.cwd(),
          })

          child.on('close', code => {
            if (code === 0) {
              resolve(code)
            } else {
              reject(
                new Error(`CSS variables generation failed with code ${code}`)
              )
            }
          })

          child.on('error', error => {
            reject(error)
          })
        })

        console.log('✅ CSS variables generated successfully')
      } catch (error) {
        console.error('❌ Failed to generate CSS variables:', error)
        throw error
      }
    },
  }
}

// Create a merged configuration for Vite and Vitest
export default defineConfig({
  plugins: [generateCSSVariablesPlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BeatUIFramework',
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
