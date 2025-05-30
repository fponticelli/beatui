#!/usr/bin/env tsx
// CSS Generation Build Script
// This script generates CSS files from TypeScript definitions at build time

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { generateCompleteCSS } from '../src/components/theme/css-generator'

const OUTPUT_DIR = 'dist'
const CSS_FILE = 'tempo-ui-lib.css'

function ensureDirectoryExists(filePath: string) {
  const dir = dirname(filePath)
  mkdirSync(dir, { recursive: true })
}

function generateCSS() {
  console.log('🎨 Generating CSS from TypeScript definitions...')

  try {
    const { complete } = generateCompleteCSS()

    const outputPath = join(OUTPUT_DIR, CSS_FILE)
    ensureDirectoryExists(outputPath)

    writeFileSync(outputPath, complete, 'utf8')

    console.log(`✅ CSS generated successfully: ${outputPath}`)
    console.log(`📦 File size: ${(complete.length / 1024).toFixed(2)} KB`)

    // Also generate a minified version for production
    const minified = complete
      .replace(/\s+/g, ' ')
      .replace(/;\s+/g, ';')
      .replace(/{\s+/g, '{')
      .replace(/\s+}/g, '}')
      .replace(/,\s+/g, ',')
      .trim()

    const minifiedPath = join(OUTPUT_DIR, CSS_FILE.replace('.css', '.min.css'))
    writeFileSync(minifiedPath, minified, 'utf8')

    console.log(`✅ Minified CSS generated: ${minifiedPath}`)
    console.log(`📦 Minified size: ${(minified.length / 1024).toFixed(2)} KB`)

    // Generate CSS variables only file for runtime theming
    const { variables } = generateCompleteCSS()
    const variablesPath = join(OUTPUT_DIR, 'variables.css')
    writeFileSync(variablesPath, variables, 'utf8')

    console.log(`✅ CSS variables file generated: ${variablesPath}`)
  } catch (error) {
    console.error('❌ Error generating CSS:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateCSS()
}

export { generateCSS }
