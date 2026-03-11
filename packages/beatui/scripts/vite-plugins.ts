import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

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

        const buildRootOnlyCss = (variables: Record<string, string>) => {
          let cssContent = ':root {\n'
          Object.entries(variables).forEach(([name, value]) => {
            cssContent += `  ${name}: ${value};\n`
          })
          cssContent += '}\n'
          return cssContent
        }

        const buildCssFromVariables = (variables: Record<string, string>) => {
          // Separate base tokens (literal values) from derived tokens (those
          // referencing other custom properties via var()).  Derived tokens are
          // placed on the `*` selector so that overriding a base token on any
          // descendant causes the derived tokens to re-evaluate in that
          // element's context — `:root`-only declarations resolve var()
          // references once and the resolved value is inherited, breaking the
          // cascade for subtree overrides.
          const base: [string, string][] = []
          const derived: [string, string][] = []

          Object.entries(variables).forEach(([name, value]) => {
            if (value.includes('var(')) {
              derived.push([name, value])
            } else {
              base.push([name, value])
            }
          })

          let cssContent = ':root {\n'
          base.forEach(([name, value]) => {
            cssContent += `  ${name}: ${value};\n`
          })
          cssContent += '}\n'

          if (derived.length > 0) {
            cssContent += '\n*, ::before, ::after {\n'
            derived.forEach(([name, value]) => {
              cssContent += `  ${name}: ${value};\n`
            })
            cssContent += '}\n'
          }

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
          buildRootOnlyCss(generateSemanticTokenVariables())
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

/**
 * Vite plugin that generates standalone CSS entry files (markdown.css, monaco.css,
 * etc.) after every build via the `closeBundle` hook.
 *
 * This replaces the standalone `build-css-entries.mjs` script and ensures the CSS
 * files survive `dist/` being emptied during watch-mode rebuilds.
 */
export function buildCssEntriesPlugin() {
  const require = createRequire(import.meta.url)

  // Breakpoint tokens for @media query resolution
  const breakpointValues: Record<string, string> = {
    sm: '40rem',
    md: '48rem',
    lg: '64rem',
    xl: '80rem',
    '2xl': '96rem',
  }

  function resolveMediaBreakpointsInCSS(css: string) {
    return css.replace(
      /(@media\s*\([^)]*?)var\(--breakpoint-(\w+)\)/g,
      (_match, before, name) => {
        const value = breakpointValues[name]
        if (!value) {
          console.warn(`⚠️  Unknown breakpoint token: --breakpoint-${name}`)
          return _match
        }
        return `${before}${value}`
      }
    )
  }

  function inlineCssImports(filePath: string, seen = new Set<string>()): string {
    const absPath = path.resolve(filePath)
    if (seen.has(absPath)) return ''
    seen.add(absPath)

    const dir = path.dirname(absPath)
    let css = fs.readFileSync(absPath, 'utf8')

    css = css.replace(
      /@import\s+(?:url\()?['"]([^'")]+)['"](?:\))?\s*(layer\([^;]+\))?\s*;?/g,
      (match, spec, layerClause) => {
        let resolved: string
        try {
          resolved = require.resolve(spec, { paths: [dir] })
        } catch {
          return match
        }

        const inlinedContent = inlineCssImports(resolved, seen)
        if (!layerClause) return inlinedContent

        const layerName = (layerClause as string).slice('layer('.length, -1).trim()
        if (!layerName) return inlinedContent

        return `@layer ${layerName} {\n${inlinedContent}\n}`
      }
    )

    return css
  }

  function writeOut(pkgRoot: string, relOut: string, content: string) {
    const outPath = path.resolve(pkgRoot, 'dist', relOut)
    const outDir = path.dirname(outPath)
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(outPath, content)
    console.log(`✅ Wrote ${relOut} (${content.length} bytes)`)
  }

  return {
    name: 'build-css-entries',
    closeBundle() {
      const pkgRoot = process.cwd()

      // Monaco CSS
      const monacoSrc = path.resolve(pkgRoot, 'src/components/monaco/monaco-editor.css')
      writeOut(pkgRoot, 'monaco.css', fs.readFileSync(monacoSrc, 'utf8'))

      // Markdown CSS
      const markdownSrc = path.resolve(pkgRoot, 'src/markdown/styles.css')
      writeOut(pkgRoot, 'markdown.css', fs.readFileSync(markdownSrc, 'utf8'))

      // ProseMirror CSS
      const prosemirrorSrc = path.resolve(pkgRoot, 'src/components/prosemirror/prosemirror-editor.css')
      writeOut(pkgRoot, 'prosemirror.css', fs.readFileSync(prosemirrorSrc, 'utf8'))

      // Lexical CSS (concatenate all lexical CSS files)
      const lexicalCssDir = path.resolve(pkgRoot, 'src/styles/layers/03.components')
      const lexicalCssFiles = [
        '_lexical-editor.css',
        '_lexical-toolbar.css',
        '_lexical-floating.css',
        '_lexical-table.css',
        '_lexical-code.css',
      ]
      let lexicalCss = ''
      for (const file of lexicalCssFiles) {
        const filePath = path.resolve(lexicalCssDir, file)
        if (fs.existsSync(filePath)) {
          lexicalCss += fs.readFileSync(filePath, 'utf8') + '\n'
        }
      }
      if (lexicalCss) writeOut(pkgRoot, 'lexical.css', lexicalCss)

      // BeatUI CSS bundles
      const standaloneSrc = path.resolve(pkgRoot, 'src/styles/styles.css')
      writeOut(pkgRoot, 'beatui.css', resolveMediaBreakpointsInCSS(inlineCssImports(standaloneSrc)))

      const tailwindSrc = path.resolve(pkgRoot, 'src/styles/tailwind.css')
      writeOut(pkgRoot, 'beatui.tailwind.css', resolveMediaBreakpointsInCSS(inlineCssImports(tailwindSrc)))
    },
  }
}
