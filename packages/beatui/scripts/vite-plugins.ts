import fs from 'fs'
import path from 'path'

import {
  breakpoints,
  type BreakpointName,
  generateCoreTokenVariables,
  generateSemanticTokenVariables,
} from '../src/tokens/index.js'

// Build a lookup from CSS var name to literal value, e.g. "var(--breakpoint-sm)" → "40rem"
const breakpointVarMap = Object.fromEntries(
  (Object.keys(breakpoints) as BreakpointName[]).map(name => [
    `var(--breakpoint-${name})`,
    breakpoints[name],
  ])
)

/**
 * Vite plugin that resolves `var(--breakpoint-*)` inside `@media` queries at
 * build time. CSS custom properties are not valid in media conditions (they are
 * evaluated at parse time before custom properties resolve), so we substitute
 * the literal token values from the breakpoint design tokens.
 *
 * Uses `generateBundle` because CSS `@import` chains in library builds bypass
 * the standard `transform` hook.
 */
export function resolveMediaBreakpointsPlugin() {
  const mediaVarPattern = /(@media\s*\([^)]*?)var\(--breakpoint-(\w+)\)/g
  return {
    name: 'resolve-media-breakpoints',
    generateBundle(_options: unknown, bundle: Record<string, { type: string; source?: string }>) {
      for (const [, asset] of Object.entries(bundle)) {
        if (asset.type !== 'asset' || typeof asset.source !== 'string') continue
        if (!asset.source.includes('var(--breakpoint-')) continue
        asset.source = asset.source.replace(
          mediaVarPattern,
          (_match, before, name) => {
            const key = `var(--breakpoint-${name})`
            const value = breakpointVarMap[key]
            if (!value) {
              console.warn(
                `⚠️  Unknown breakpoint token: --breakpoint-${name}`
              )
              return _match
            }
            return `${before}${value}`
          }
        )
      }
    },
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
