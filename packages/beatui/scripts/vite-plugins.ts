import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import {
  generateCoreTokenVariables,
  generateSemanticTokenVariables,
} from '../src/tokens/index.js'

function formatWithPrettier(filePath: string) {
  try {
    const res = spawnSync(
      'pnpm',
      ['exec', 'prettier', '--log-level', 'warn', '--write', filePath],
      { stdio: 'inherit' }
    )
    if (res.status === 0) return
  } catch {
    // pnpm not available, try next method
  }
  try {
    const res = spawnSync(
      'npx',
      ['prettier', '--log-level', 'warn', '--write', filePath],
      { stdio: 'inherit' }
    )
    if (res.status === 0) return
  } catch {
    // npx not available, try next method
  }
  try {
    spawnSync('prettier', ['--write', filePath], { stdio: 'inherit' })
  } catch {
    console.warn('Warning: Prettier not available to format', filePath)
  }
}

/**
 * Vite plugin to generate CSS variables before build
 * Runs the CSS variables generation script during the build process
 */
export function generateCSSVariablesPlugin() {
  return {
    name: 'generate-css-variables',
    buildStart: async () => {
      console.log('🎨 Generating CSS variables from design tokens...')

      try {
        // Build CSS variables content inline (no child process)
        const pkgRoot = process.cwd()

        const coreOutput = path.resolve(pkgRoot, 'src/styles/base/tokens-core.css')
        const semanticOutput = path.resolve(
          pkgRoot,
          'src/styles/base/tokens-semantic.css'
        )
        const shimOutput = path.resolve(
          pkgRoot,
          'src/styles/layers/02.base/variables.css'
        )

        const buildCssFromVariables = (variables: Record<string, string>) => {
          let cssContent = ':root {\n'
          Object.entries(variables).forEach(([name, value]) => {
            cssContent += `  ${name}: ${value};\n`
          })
          cssContent += '}\n'
          return cssContent
        }

        const writeCss = (outputPath: string, content: string) => {
          const dirname = path.dirname(outputPath)
          if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true })
          }
          fs.writeFileSync(outputPath, content, 'utf8')
          try {
            formatWithPrettier(outputPath)
          } catch {
            // Prettier formatting is optional - ignore failures
          }
        }

        writeCss(coreOutput, buildCssFromVariables(generateCoreTokenVariables()))
        writeCss(
          semanticOutput,
          buildCssFromVariables(generateSemanticTokenVariables())
        )
        writeCss(
          shimOutput,
          "@import '../../base/tokens-core.css';\n@import '../../base/tokens-semantic.css';\n"
        )

        console.log('✅ CSS variables generated for BeatUI tokens')
      } catch (error) {
        console.error('❌ Failed to generate CSS variables:', error)
        throw error
      }
    },
  }
}
