import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

function inlineCssImports(filePath, seen = new Set()) {
  const absPath = path.resolve(filePath)
  if (seen.has(absPath)) return ''
  seen.add(absPath)

  const dir = path.dirname(absPath)
  let css = readFileSync(absPath, 'utf8')

  // Replace simple @import "..."; with inlined content recursively
  css = css.replace(/@import\s+['"]([^'"\)]+)['"];?/g, (_, spec) => {
    try {
      // Resolve bare or relative specifiers using Node resolution
      const resolved = require.resolve(spec, { paths: [dir] })
      return inlineCssImports(resolved, seen)
    } catch (_e) {
      // If resolution fails, keep the original import
      return `@import "${spec}";`
    }
  })

  return css
}

function writeOut(relOut, content) {
  const outPath = path.resolve(process.cwd(), 'dist', relOut)
  const outDir = path.dirname(outPath)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  writeFileSync(outPath, content)
  console.log(`✅ Wrote ${relOut} (${content.length} bytes)`)
}

function main() {
  const pkgRoot = process.cwd()

  // Build Milkdown CSS bundle (with @imports inlined)
  const milkdownSrc = path.resolve(
    pkgRoot,
    'src/components/milkdown/milkdown.css'
  )
  const milkdownCss = inlineCssImports(milkdownSrc)
  writeOut('milkdown.css', milkdownCss)

  // Build Monaco CSS (simple copy)
  const monacoSrc = path.resolve(
    pkgRoot,
    'src/components/monaco/monaco-editor.css'
  )
  const monacoCss = readFileSync(monacoSrc, 'utf8')
  writeOut('monaco.css', monacoCss)

  // Build Markdown CSS (simple copy)
  const markdownSrc = path.resolve(pkgRoot, 'src/markdown/styles.css')
  const markdownCss = readFileSync(markdownSrc, 'utf8')
  writeOut('markdown.css', markdownCss)
}

main()
