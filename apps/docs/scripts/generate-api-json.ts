import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

console.log('Generating API JSON with TypeDoc...')

execSync('npx typedoc --options typedoc.json', {
  cwd: ROOT,
  stdio: 'inherit',
})

console.log('API JSON generated at public/api.json')
