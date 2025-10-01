import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import { generateAllTokenVariables } from '../src/tokens/index.js'

function formatWithPrettier(filePath: string) {
  try {
    const res = spawnSync(
      'pnpm',
      ['exec', 'prettier', '--log-level', 'warn', '--write', filePath],
      { stdio: 'inherit' }
    )
    if (res.status === 0) return
  } catch {}
  try {
    const res = spawnSync(
      'npx',
      ['prettier', '--log-level', 'warn', '--write', filePath],
      { stdio: 'inherit' }
    )
    if (res.status === 0) return
  } catch {}
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
        const variables = generateAllTokenVariables()
        let cssContent = ':root {\n'
        Object.entries(variables).forEach(([name, value]) => {
          cssContent += `  ${name}: ${value};\n`
        })
        cssContent += '  }\n'

        const outputPath = path.resolve(
          process.cwd(),
          'src/styles/layers/02.base/variables.css'
        )

        const dirname = path.dirname(outputPath)
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true })
        }

        fs.writeFileSync(outputPath, cssContent, 'utf8')
        try {
          formatWithPrettier(outputPath)
        } catch {}

        console.log(`✅ CSS variables generated at ${outputPath}`)
      } catch (error) {
        console.error('❌ Failed to generate CSS variables:', error)
        throw error
      }
    },
  }
}
