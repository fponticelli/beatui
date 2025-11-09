#!/usr/bin/env node

/**
 * Convert @/ path aliases to relative imports
 * This ensures TypeScript generates correct .d.ts files with relative imports
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname, relative } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(__dirname, '../src')

// Find all TypeScript files with @/ imports (static or dynamic)
const files = execSync(
  `find "${srcDir}" -name "*.ts" -type f ! -path "*/node_modules/*" -exec grep -l "@/" {} \\;`,
  { encoding: 'utf-8' }
)
  .trim()
  .split('\n')
  .filter(Boolean)

console.log(`Found ${files.length} files with @/ imports`)

let totalReplacements = 0

for (const file of files) {
  let content = readFileSync(file, 'utf-8')
  let replacements = 0

  const convertPath = (importPath) => {
    const currentDir = dirname(file)
    const targetPath = resolve(srcDir, importPath)
    let relativePath = relative(currentDir, targetPath)

    // Ensure relative path starts with ./ or ../
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath
    }

    // Use forward slashes on all platforms
    relativePath = relativePath.replace(/\\/g, '/')

    return relativePath
  }

  // Match: from '@/...'  or  from "@/..."
  const importRegex = /from\s+['"]@\/([^'"]+)['"]/g
  content = content.replace(importRegex, (match, importPath) => {
    replacements++
    return `from '${convertPath(importPath)}'`
  })

  // Match: import('@/...')  or  import("@/...")
  const dynamicImportRegex = /import\(['"]@\/([^'"]+)['"]\)/g
  content = content.replace(dynamicImportRegex, (match, importPath) => {
    replacements++
    return `import('${convertPath(importPath)}')`
  })

  if (replacements > 0) {
    writeFileSync(file, content, 'utf-8')
    console.log(`✓ ${file.replace(srcDir + '/', '')} (${replacements} imports)`)
    totalReplacements += replacements
  }
}

console.log(`\n✅ Converted ${totalReplacements} imports in ${files.length} files`)

