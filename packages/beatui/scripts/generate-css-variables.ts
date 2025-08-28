import fs from 'fs'
import path from 'path'
import { generateAllTokenVariables } from '../src/tokens/index.js'

// Generate CSS variables content
function generateCSSVariables(): string {
  const variables = generateAllTokenVariables()

  let cssContent = ':root {\n'

  // Add each variable to the CSS content
  Object.entries(variables).forEach(([name, value]) => {
    cssContent += `  ${name}: ${value};\n`
  })

  cssContent += '  }\n'

  return cssContent
}

// Ensure directory exists
function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath)
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true })
  }
}

// Main function
function main() {
  const outputPath = path.resolve(
    process.cwd(),
    'src/styles/layers/02.base/variables.css'
  )
  const cssContent = generateCSSVariables()

  ensureDirectoryExists(outputPath)
  fs.writeFileSync(outputPath, cssContent, 'utf8')

  console.log(`✅ CSS variables generated at ${outputPath}`)
}

main()
