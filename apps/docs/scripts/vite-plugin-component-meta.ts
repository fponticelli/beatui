import type { Plugin } from 'vite'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'
import { extractAllComponentMeta, generateMetaSource } from './extract-component-meta'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REGISTRY_DIR = path.resolve(__dirname, '../src/registry')
const OUTPUT_FILE = path.join(REGISTRY_DIR, 'component-meta.ts')
const BEATUI_SRC = path.resolve(__dirname, '../../../packages/beatui/src')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function generate() {
  ensureDir(REGISTRY_DIR)
  console.log('[component-meta] Extracting component metadata from', BEATUI_SRC)
  const meta = extractAllComponentMeta(BEATUI_SRC)
  const componentNames = Object.keys(meta)
  console.log(
    `[component-meta] Extracted ${componentNames.length} components: ${componentNames.join(', ')}`
  )
  const source = generateMetaSource(meta)
  fs.writeFileSync(OUTPUT_FILE, source, 'utf-8')
  console.log('[component-meta] Written to', OUTPUT_FILE)
}

export function componentMetaPlugin(): Plugin {
  return {
    name: 'beatui-component-meta',
    buildStart() {
      generate()
    },
    configureServer(server) {
      const watcher = server.watcher
      const srcGlob = path.join(BEATUI_SRC, 'components/**/*.ts')

      watcher.add(srcGlob)
      watcher.on('change', (file: string) => {
        if (file.startsWith(BEATUI_SRC) && file.endsWith('.ts')) {
          console.log('[component-meta] Source changed, regenerating...')
          try {
            generate()
          } catch (e) {
            console.error('[component-meta] Error regenerating:', e)
          }
        }
      })
    },
  }
}
