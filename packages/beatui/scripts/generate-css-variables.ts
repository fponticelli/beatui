import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

import {
  generateCoreTokenVariables,
  generateSemanticTokenVariables,
} from '../src/tokens/index.js'

function formatWithPrettier(filePath: string) {
  const formatters = [
    ['pnpm', ['exec', 'prettier', '--log-level', 'warn', '--write', filePath]],
    ['npx', ['prettier', '--log-level', 'warn', '--write', filePath]],
    ['prettier', ['--write', filePath]],
  ] as const

  for (const [command, args] of formatters) {
    try {
      const res = spawnSync(command, args, { stdio: 'inherit' })
      if (res.status === 0) return
    } catch {
      // ignore and try next formatter
    }
  }

  console.warn('Warning: Prettier not available to format', filePath)
}

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath)
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true })
  }
}

function buildCssFromVariables(variables: Record<string, string>): string {
  let cssContent = ':root {\n'
  Object.entries(variables).forEach(([name, value]) => {
    cssContent += `  ${name}: ${value};\n`
  })
  cssContent += '}\n'
  return cssContent
}

function writeCss(filePath: string, content: string) {
  ensureDirectoryExists(filePath)
  fs.writeFileSync(filePath, content, 'utf8')
  try {
    formatWithPrettier(filePath)
  } catch {
    // Prettier formatting is optional - ignore failures
  }
}

function main() {
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

  const coreCss = buildCssFromVariables(generateCoreTokenVariables())
  const semanticCss = buildCssFromVariables(generateSemanticTokenVariables())
  const shimCss =
    "@import '../../base/tokens-core.css';\n@import '../../base/tokens-semantic.css';\n"

  writeCss(coreOutput, coreCss)
  writeCss(semanticOutput, semanticCss)
  writeCss(shimOutput, shimCss)

  console.log('✅ CSS token files refreshed')
}

main()
