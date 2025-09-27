#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SRC_DIR = path.resolve(__dirname, '..', 'src')
const PACKAGE_ROOT = path.resolve(__dirname, '..')

const FILE_PATTERN = /\.(ts|tsx)$/i
const LEGACY_LITERAL = /['"`]bu-[^'"`]*['"`]/g
const ALLOWED_LITERALS = new Set([
  'bu-toggle',
  'bu-toggle-animation',
  'bu-toggle-state',
])

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const resolved = path.resolve(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(resolved)))
    } else if (FILE_PATTERN.test(entry.name)) {
      files.push(resolved)
    }
  }

  return files
}

async function main() {
  const files = await walk(SRC_DIR)
  const violations = []

  for (const file of files) {
    const content = await readFile(file, 'utf8')
    const matches = content.matchAll(LEGACY_LITERAL)

    for (const match of matches) {
      const literal = match[0].slice(1, -1)
      if (ALLOWED_LITERALS.has(literal)) {
        continue
      }

      const index = match.index ?? 0
      const line = content.slice(0, index).split('\n').length
      const column = index - content.lastIndexOf('\n', index - 1)
      const relativePath = path.relative(PACKAGE_ROOT, file)

      violations.push({ relativePath, line, column, literal })
    }
  }

  if (violations.length === 0) {
    process.exit(0)
  }

  console.error('Legacy BeatUI utility class literals detected:')
  for (const violation of violations) {
    const { relativePath, line, column, literal } = violation
    console.error(`  ${relativePath}:${line}:${column} -> "${literal}"`)
  }

  process.exitCode = 1
}

main().catch(error => {
  console.error('Failed to scan for legacy utility classes:', error)
  process.exitCode = 1
})
