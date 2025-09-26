import { existsSync, mkdirSync, copyFileSync, writeFileSync, unlinkSync } from 'fs'
import { spawnSync } from 'child_process'
import path from 'path'

const pkgRoot = process.cwd()
const distRoot = path.resolve(pkgRoot, 'dist')
const tailwindDir = path.resolve(distRoot, 'tailwind')
const cssDir = path.resolve(distRoot, 'css')

const ensureDir = (dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function copyIfExists(src, dest) {
  if (!existsSync(src)) {
    throw new Error(`Missing build artifact: ${src}`)
  }
  ensureDir(path.dirname(dest))
  copyFileSync(src, dest)
  console.log(`✅ Copied ${path.relative(distRoot, src)} → ${path.relative(distRoot, dest)}`)
}

function main() {
  ensureDir(tailwindDir)
  ensureDir(cssDir)

  const esBundle = path.resolve(tailwindDir, 'index.es.js')
  const cjsBundle = path.resolve(tailwindDir, 'index.cjs.js')

  copyIfExists(esBundle, path.resolve(tailwindDir, 'preset.mjs'))
  copyIfExists(cjsBundle, path.resolve(tailwindDir, 'preset.cjs'))

  // Tokens + preset are already bundled together; create an alias file so consumers can require the preset via the directory root.
  copyIfExists(esBundle, path.resolve(tailwindDir, 'index.mjs'))
  copyIfExists(cjsBundle, path.resolve(tailwindDir, 'index.cjs'))

  // Emit root declaration file that re-exports Tailwind types.
  const typesEntry = path.resolve(distRoot, 'types/tailwind/index.d.ts')
  if (existsSync(typesEntry)) {
    const declContent = "export * from './types/tailwind/index';\nexport { default } from './types/tailwind/index';\n"
    writeFileSync(path.resolve(distRoot, 'tailwind.d.ts'), declContent)
    console.log('✅ Wrote tailwind.d.ts')
  } else {
    console.warn('⚠️ Missing type declarations for tailwind entry.')
  }

  // Copy legacy standalone CSS into the new css/ directory
  const standaloneSrc = path.resolve(distRoot, 'beatui.css')
  const standaloneDest = path.resolve(cssDir, 'beatui-standalone.css')
  copyIfExists(standaloneSrc, standaloneDest)

  const componentsDest = path.resolve(cssDir, 'beatui-components.css')
  const tailwindBin = path.resolve(pkgRoot, 'node_modules/.bin/tailwindcss')
  const tailwindInput = path.resolve(pkgRoot, 'src/styles/tailwind/components.css')

  if (existsSync(tailwindBin) && existsSync(tailwindInput)) {
    const tempConfigPath = path.resolve(distRoot, 'tailwind.temp.config.cjs')
    const tempConfig = `const beatuiPreset = require('./tailwind/preset.cjs');

module.exports = {
  presets: [beatuiPreset()],
  darkMode: ['class', '.b-dark'],
  corePlugins: { preflight: false },
  content: [],
};
`
    writeFileSync(tempConfigPath, tempConfig)

    const result = spawnSync(
      tailwindBin,
      ['--config', tempConfigPath, '--input', tailwindInput, '--output', componentsDest, '--minify'],
      { stdio: 'inherit' }
    )

    if (existsSync(tempConfigPath)) {
      unlinkSync(tempConfigPath)
    }

    if (result.status !== 0) {
      throw new Error('Tailwind CSS build failed')
    }
  } else {
    if (!existsSync(tailwindBin)) {
      console.warn('⚠️ tailwindcss binary not found; skipping components CSS generation.')
    }
    if (!existsSync(tailwindInput)) {
      console.warn('⚠️ Missing Tailwind input CSS; skipping components CSS generation.')
    }
    if (!existsSync(componentsDest)) {
      writeFileSync(componentsDest, '/* Tailwind components output not generated. */\n')
    }
  }
}

main()
