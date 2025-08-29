import { spawn, spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import {
  generateBackgroundUtilities,
  generateForegroundUtilities,
} from '../src/tokens/colors.js'

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

/**
 * Vite plugin to generate background utility classes
 * Creates background utility classes from design tokens
 */
export function generateBackgroundUtilitiesPlugin() {
  return {
    name: 'generate-background-utilities',
    buildStart: async () => {
      console.log('🎨 Generating background utility classes...')

      try {
        const bgCSS = generateBackgroundUtilities()
        const outputPath = path.resolve(
          process.cwd(),
          'src/styles/layers/05.utilities/bg.css'
        )

        // Ensure directory exists
        const dirname = path.dirname(outputPath)
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true })
        }

        // Write the generated CSS
        fs.writeFileSync(outputPath, bgCSS, 'utf8')
        // Format the generated CSS
        try {
          formatWithPrettier(outputPath)
        } catch {}

        console.log(`✅ Background utilities generated at ${outputPath}`)
      } catch (error) {
        console.error('❌ Failed to generate background utilities:', error)
        throw error
      }
    },
  }
}

/**
 * Vite plugin to generate foreground (text color) utility classes
 * Creates foreground utility classes from design tokens
 */
export function generateForegroundUtilitiesPlugin() {
  return {
    name: 'generate-foreground-utilities',
    buildStart: async () => {
      console.log('🎨 Generating foreground utility classes...')

      try {
        const fgCSS = generateForegroundUtilities()
        const outputPath = path.resolve(
          process.cwd(),
          'src/styles/layers/05.utilities/fg.css'
        )

        // Ensure directory exists
        const dirname = path.dirname(outputPath)
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true })
        }

        // Write the generated CSS
        fs.writeFileSync(outputPath, fgCSS, 'utf8')
        // Format the generated CSS
        try {
          formatWithPrettier(outputPath)
        } catch {}

        console.log(`✅ Foreground utilities generated at ${outputPath}`)
      } catch (error) {
        console.error('❌ Failed to generate foreground utilities:', error)
        throw error
      }
    },
  }
}
