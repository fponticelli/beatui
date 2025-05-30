// Vite Plugin for CSS Generation
// This plugin integrates CSS generation into the Vite build process

import { Plugin } from 'vite'
import { generateCompleteCSS } from './css-generator'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname, resolve, relative } from 'path'

export interface TempoUIPluginOptions {
  outputDir?: string
  filename?: string
  generateMinified?: boolean
  generateVariablesOnly?: boolean
  watch?: boolean
}

export function tempoUIPlugin(options: TempoUIPluginOptions = {}): Plugin {
  const {
    outputDir = 'dist',
    filename = 'tempo-ui-lib.css',
    generateMinified = true,
    generateVariablesOnly = true,
    watch = true,
  } = options

  let isProduction = false

  function ensureDirectoryExists(filePath: string) {
    const dir = dirname(filePath)
    mkdirSync(dir, { recursive: true })
  }

  function generateAndWriteCSS(outDir: string) {
    try {
      console.log('🎨 Generating Tempo UI CSS...')

      const { complete, variables } = generateCompleteCSS()

      // Main CSS file
      const cssPath = join(outDir, filename)
      ensureDirectoryExists(cssPath)
      writeFileSync(cssPath, complete, 'utf8')

      console.log(
        `✅ Generated: ${cssPath} (${(complete.length / 1024).toFixed(2)} KB)`
      )

      // Minified version for production
      if (generateMinified && isProduction) {
        const minified = complete
          .replace(/\s+/g, ' ')
          .replace(/;\s+/g, ';')
          .replace(/{\s+/g, '{')
          .replace(/\s+}/g, '}')
          .replace(/,\s+/g, ',')
          .trim()

        const minifiedPath = join(outDir, filename.replace('.css', '.min.css'))
        writeFileSync(minifiedPath, minified, 'utf8')

        console.log(
          `✅ Generated: ${minifiedPath} (${(minified.length / 1024).toFixed(2)} KB)`
        )
      }

      // Variables-only file for runtime theming
      if (generateVariablesOnly) {
        const variablesPath = join(outDir, 'variables.css')
        writeFileSync(variablesPath, variables, 'utf8')

        console.log(
          `✅ Generated: ${variablesPath} (${(variables.length / 1024).toFixed(2)} KB)`
        )
      }
    } catch (error) {
      console.error('❌ Error generating Tempo UI CSS:', error)
      throw error
    }
  }

  return {
    name: 'tempo-ui-css-generator',

    configResolved(config) {
      isProduction = config.command === 'build'
    },

    buildStart() {
      // Generate CSS at the start of the build
      if (isProduction) {
        generateAndWriteCSS(outputDir)
      }
    },

    configureServer(server) {
      // In development, regenerate CSS when theme files change
      if (watch && !isProduction) {
        const themeFiles = [
          'src/components/theme/css-variables.ts',
          'src/components/theme/css-generator.ts',
          'src/components/theme/bem-classes.ts',
          'src/components/theme/theme-system.ts',
        ]

        // Debounce timeout for regeneration
        let regenerateTimeout: NodeJS.Timeout | undefined

        const regenerateCSS = () => {
          console.log('🎨 Regenerating CSS...')
          try {
            generateAndWriteCSS(outputDir)

            // Notify browser to reload
            server.ws.send({
              type: 'full-reload',
              path: '*',
            })

            console.log('✅ CSS regenerated and browser notified')
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error'

            console.error('❌ Error regenerating CSS:', error)
            // Send error to browser console
            server.ws.send('error', {
              message: `CSS generation failed: ${errorMessage}`,
            })
          }
        }

        const debouncedRegenerate = () => {
          if (regenerateTimeout) {
            clearTimeout(regenerateTimeout)
          }
          regenerateTimeout = setTimeout(regenerateCSS, 300)
        }

        // Add theme files to Vite's watcher
        themeFiles.forEach(file => {
          const fullPath = resolve(file)
          server.watcher.add(fullPath)
        })

        // Listen for file changes
        server.watcher.on('change', (filePath: string) => {
          const relativePath = relative(process.cwd(), filePath)
          if (themeFiles.some(themeFile => relativePath.includes(themeFile))) {
            console.log(`🔄 Theme file changed: ${relativePath}`)
            debouncedRegenerate()
          }
        })

        server.watcher.on('add', (filePath: string) => {
          const relativePath = relative(process.cwd(), filePath)
          if (themeFiles.some(themeFile => relativePath.includes(themeFile))) {
            console.log(`➕ New theme file: ${relativePath}`)
            debouncedRegenerate()
          }
        })

        // Clean up timeout when server closes
        server.httpServer?.on('close', () => {
          if (regenerateTimeout) {
            clearTimeout(regenerateTimeout)
          }
        })

        // Generate CSS on server start
        console.log('🎨 Generating initial CSS for development...')
        generateAndWriteCSS(outputDir)
        console.log('👀 Watching theme files for changes...')
        themeFiles.forEach(file => {
          console.log(`   - ${file}`)
        })
      }
    },

    generateBundle(_options, _bundle) {
      // Add the generated CSS to the bundle
      if (isProduction) {
        try {
          const { complete } = generateCompleteCSS()

          // Add CSS as an asset to the bundle
          this.emitFile({
            type: 'asset',
            fileName: filename,
            source: complete,
          })

          if (generateMinified) {
            const minified = complete
              .replace(/\s+/g, ' ')
              .replace(/;\s+/g, ';')
              .replace(/{\s+/g, '{')
              .replace(/\s+}/g, '}')
              .replace(/,\s+/g, ',')
              .trim()

            this.emitFile({
              type: 'asset',
              fileName: filename.replace('.css', '.min.css'),
              source: minified,
            })
          }

          if (generateVariablesOnly) {
            const { variables } = generateCompleteCSS()
            this.emitFile({
              type: 'asset',
              fileName: 'variables.css',
              source: variables,
            })
          }
        } catch (error) {
          this.error(`Failed to generate Tempo UI CSS: ${error}`)
        }
      }
    },

    // Virtual module for importing generated CSS
    resolveId(id) {
      if (id === 'virtual:tempo-ui-css') {
        return id
      }
    },

    load(id) {
      if (id === 'virtual:tempo-ui-css') {
        const { complete } = generateCompleteCSS()
        return `export default ${JSON.stringify(complete)}`
      }
    },
  }
}

// Helper function to create a development-only plugin
export function tempoUIDevPlugin(options: TempoUIPluginOptions = {}): Plugin {
  return {
    ...tempoUIPlugin({ ...options, watch: true }),
    apply: 'serve',
  }
}

// Helper function to create a build-only plugin
export function tempoUIBuildPlugin(options: TempoUIPluginOptions = {}): Plugin {
  return {
    ...tempoUIPlugin({ ...options, watch: false }),
    apply: 'build',
  }
}
