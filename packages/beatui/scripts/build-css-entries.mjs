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

  // Replace @import statements with inlined content recursively, preserving layer(...) info
  css = css.replace(
    /@import\s+(?:url\()?['"]([^'"\)]+)['"](?:\))?\s*(layer\([^;]+\))?\s*;?/g,
    (match, spec, layerClause) => {
      let resolved
      try {
        // Resolve bare or relative specifiers using Node resolution
        resolved = require.resolve(spec, { paths: [dir] })
      } catch (_e) {
        // If resolution fails, keep the original import intact
        return match
      }

      const inlinedContent = inlineCssImports(resolved, seen)
      if (!layerClause) {
        return inlinedContent
      }

      const layerName = layerClause.slice('layer('.length, -1).trim()
      if (!layerName) {
        return inlinedContent
      }

      return `@layer ${layerName} {\n${inlinedContent}\n}`
    }
  )

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

  // Build ProseMirror CSS (simple copy)
  const prosemirrorSrc = path.resolve(
    pkgRoot,
    'src/components/prosemirror/prosemirror-editor.css'
  )
  const prosemirrorCss = readFileSync(prosemirrorSrc, 'utf8')
  writeOut('prosemirror.css', prosemirrorCss)

  // Build BeatUI CSS bundles
  const standaloneSrc = path.resolve(pkgRoot, 'src/styles/styles.css')
  const standaloneCss = inlineCssImports(standaloneSrc)
  writeOut('beatui.css', standaloneCss)

  const tailwindSrc = path.resolve(pkgRoot, 'src/styles/tailwind.css')
  const tailwindCss = inlineCssImports(tailwindSrc)
  writeOut('beatui.tailwind.css', tailwindCss)
}

main()
