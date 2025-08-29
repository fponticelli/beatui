import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Parse routes from apps/docs/src/app.ts by simple string scanning
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const APP_TS = path.join(ROOT, 'src/app.ts')
const DIST = path.join(ROOT, 'dist')

const read = (p: string) => fs.readFileSync(p, 'utf8')

const parseRoutes = (src: string): string[] => {
  const routes: string[] = []
  const routeRe = /'\/(?:[^']*)'\s*:\s*[A-Za-z0-9_]+Page/g
  let m: RegExpExecArray | null
  while ((m = routeRe.exec(src))) {
    const key = m[0].split(':')[0].trim().slice(1, -1)
    routes.push(key)
  }
  // Include root explicitly
  if (!routes.includes('/')) routes.unshift('/')
  return Array.from(new Set(routes))
}

const toFilePath = (url: string): string => {
  const u = url.startsWith('/') ? url.slice(1) : url
  if (u === '') return 'index.html'
  if (u.endsWith('/')) return `${u}index.html`
  return `${u}.html`
}

const main = () => {
  const appSrc = read(APP_TS)
  const routes = parseRoutes(appSrc)

  const missing: string[] = []
  const empty: string[] = []

  for (const r of routes) {
    const file = path.join(DIST, toFilePath(r))
    if (!fs.existsSync(file)) {
      missing.push(r)
      continue
    }
    const content = fs.readFileSync(file, 'utf8')
    if (!content || content.trim().length === 0) {
      empty.push(r)
    }
  }

  if (missing.length || empty.length) {
    console.error('Static validation failed:')
    if (missing.length) console.error('Missing pages:', missing)
    if (empty.length) console.error('Empty pages:', empty)
    process.exit(1)
  }

  console.log(`Static validation passed for ${routes.length} routes.`)
}

main()
