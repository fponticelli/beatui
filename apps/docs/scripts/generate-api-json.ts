import { execFileSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const OUTPUT = path.resolve(ROOT, 'public/api.json')

const force = process.argv.includes('--force')

if (!force && existsSync(OUTPUT)) {
  console.log(
    'API JSON already exists at public/api.json (skipping). Re-run with --force to regenerate.'
  )
  process.exit(0)
}

console.log('Generating API JSON with TypeDoc...')

execFileSync('npx', ['typedoc', '--options', 'typedoc.json'], {
  cwd: ROOT,
  stdio: 'inherit',
})

console.log('API JSON generated at public/api.json')
