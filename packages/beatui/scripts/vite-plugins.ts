import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { breakpoints } from '../src/tokens/breakpoints.js'
import { generateBackgroundUtilities } from '../src/tokens/colors.js'

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
 * Generate breakpoint-specific utility classes from utilities.css
 * Creates responsive versions of all utility classes for each breakpoint
 */
function generateBreakpointUtilities(): string {
  const utilitiesPath = path.resolve(
    process.cwd(),
    'src/styles/layers/05.utilities/utilities.css'
  )

  if (!fs.existsSync(utilitiesPath)) {
    throw new Error(`Utilities file not found at ${utilitiesPath}`)
  }

  const utilitiesContent = fs.readFileSync(utilitiesPath, 'utf8')

  // Extract utility classes from the CSS content
  const utilityClassRegex = /\.bu-[\w-]+\s*{[^}]+}/g
  const utilityClasses = utilitiesContent.match(utilityClassRegex) || []

  let breakpointCSS = ''

  // Generate breakpoint-specific versions for each utility class
  Object.entries(breakpoints).forEach(([breakpointName, breakpointValue]) => {
    breakpointCSS += `/* ${breakpointName.toUpperCase()} Breakpoint (${breakpointValue}) */\n`
    breakpointCSS += `@media (width >= ${breakpointValue}) {\n`

    utilityClasses.forEach(utilityClass => {
      // Transform .bu-class to .bu-sm:class, .bu-md:class, etc.
      const transformedClass = utilityClass.replace(
        /\.bu-([\w-]+)/,
        `.${breakpointName.startsWith('2') ? '\\' : ''}${breakpointName}\\:bu-$1`
      )
      breakpointCSS += `  ${transformedClass}\n`
    })

    breakpointCSS += '}\n\n'
  })

  return breakpointCSS
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

        console.log(`✅ Background utilities generated at ${outputPath}`)
      } catch (error) {
        console.error('❌ Failed to generate background utilities:', error)
        throw error
      }
    },
  }
}

/**
 * Vite plugin to generate breakpoint-specific utility classes
 * Creates responsive versions of all utility classes for each breakpoint
 */
export function generateBreakpointUtilitiesPlugin() {
  return {
    name: 'generate-breakpoint-utilities',
    buildStart: async () => {
      console.log('📱 Generating breakpoint-specific utility classes...')

      try {
        const breakpointCSS = generateBreakpointUtilities()
        const outputPath = path.resolve(
          process.cwd(),
          'src/styles/layers/05.utilities/breakpoint-utilities.css'
        )

        // Ensure directory exists
        const dirname = path.dirname(outputPath)
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true })
        }

        // Write the generated CSS
        fs.writeFileSync(outputPath, breakpointCSS, 'utf8')

        console.log(`✅ Breakpoint utilities generated at ${outputPath}`)
      } catch (error) {
        console.error('❌ Failed to generate breakpoint utilities:', error)
        throw error
      }
    },
  }
}
