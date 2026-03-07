import type { Plugin } from 'vite'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PAGES_DIR = path.resolve(__dirname, '../src/pages/components')
const GUIDES_DIR = path.resolve(__dirname, '../src/pages/guides')
const API_JSON = path.resolve(__dirname, '../public/api.json')
const OUTPUT_FILE = path.resolve(__dirname, '../public/search-index.json')

export interface SearchEntry {
  /** Entry type */
  type: 'component' | 'api' | 'guide'
  /** Display name */
  name: string
  /** URL path (relative) */
  url: string
  /** Category / section for grouping */
  category: string
  /** Short description */
  description: string
  /** Additional search keywords */
  keywords: string[]
  /** Icon hint for the UI */
  icon: string
}

// --- Component page extraction ---

function extractMeta(
  content: string
): {
  name: string
  category: string
  description: string
  component: string
  tags?: string[]
} | null {
  const metaMatch = content.match(
    /export\s+const\s+meta\s*(?::\s*\w+)?\s*=\s*(\{[\s\S]*?\n\})/
  )
  if (!metaMatch) return null

  try {
    const objStr = metaMatch[1]
      .replace(/\/\/.*$/gm, '')
      .replace(/,\s*\}/g, '}')
    const fn = new Function(`return ${objStr}`)
    return fn()
  } catch {
    return null
  }
}

function extractSections(
  content: string
): { title: string; description: string }[] {
  const sections: { title: string; description: string }[] = []

  const sectionRegex = /\bSection\(\s*\n?\s*(['"`])((?:(?!\1).)*)\1/g
  let match
  while ((match = sectionRegex.exec(content)) !== null) {
    const title = match[2]

    const after = content.slice(match.index)
    let depth = 0
    let inStr = false
    let strChar = ''
    let i = 0
    for (; i < after.length; i++) {
      const c = after[i]
      if (inStr) {
        if (c === '\\') {
          i++
          continue
        }
        if (c === strChar) inStr = false
        continue
      }
      if (c === '(') depth++
      else if (c === ')') {
        depth--
        if (depth === 0) break
      } else if (c === "'" || c === '"' || c === '`') {
        inStr = true
        strChar = c
      }
    }
    const fullCall = after.slice(0, i + 1)

    const strLiterals = [
      ...fullCall.matchAll(/(['"])((?:(?!\1).)*?)\1/g),
    ]
    const description =
      strLiterals.length > 1
        ? strLiterals[strLiterals.length - 1][2]
        : ''

    sections.push({ title, description })
  }

  return sections
}

function extractComponentEntries(): SearchEntry[] {
  if (!fs.existsSync(PAGES_DIR)) return []

  const files = fs
    .readdirSync(PAGES_DIR)
    .filter(f => f.endsWith('.ts') && !f.startsWith('_'))
    .sort()

  const entries: SearchEntry[] = []

  for (const file of files) {
    const filePath = path.join(PAGES_DIR, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const slug = file.replace(/\.ts$/, '')
    const meta = extractMeta(content)
    if (!meta) continue

    const sections = extractSections(content)

    const keywords = [
      ...(meta.tags ?? []),
      ...sections.map(s => s.title),
      ...sections.map(s => s.description).filter(Boolean),
      meta.component,
    ]

    entries.push({
      type: 'component',
      name: meta.name,
      url: `/components/${slug}`,
      category: meta.category,
      description: meta.description,
      keywords,
      icon: 'component',
    })
  }

  return entries
}

// --- Guide page extraction ---

/** Guide page metadata — simpler than component meta, just title + description */
interface GuideMeta {
  title: string
  description: string
}

function extractGuideMeta(content: string): GuideMeta | null {
  const match = content.match(
    /export\s+const\s+meta\s*(?::\s*\w+)?\s*=\s*(\{[\s\S]*?\n\})/
  )
  if (!match) return null

  try {
    const objStr = match[1]
      .replace(/\/\/.*$/gm, '')
      .replace(/,\s*\}/g, '}')
    const fn = new Function(`return ${objStr}`)
    return fn()
  } catch {
    return null
  }
}

function extractGuideEntries(): SearchEntry[] {
  if (!fs.existsSync(GUIDES_DIR)) return []

  const files = fs
    .readdirSync(GUIDES_DIR)
    .filter(f => f.endsWith('.ts') && !f.startsWith('_'))
    .sort()

  const entries: SearchEntry[] = []

  for (const file of files) {
    const filePath = path.join(GUIDES_DIR, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const slug = file.replace(/\.ts$/, '')
    const meta = extractGuideMeta(content)

    const sections = extractSections(content)
    const title = meta?.title ?? slug.replace(/-/g, ' ')
    const description = meta?.description ?? ''

    entries.push({
      type: 'guide',
      name: title,
      url: `/guides/${slug}`,
      category: 'Guides',
      description,
      keywords: sections.map(s => s.title),
      icon: 'guide',
    })
  }

  return entries
}

// --- API reference extraction ---

/** Module slug mapping (typedocName → slug) matching api-data.ts MODULES */
const MODULE_SLUGS: Record<string, string> = {
  index: 'main',
  auth: 'auth',
  'better-auth': 'better-auth',
  'json-schema': 'json-schema',
  'json-schema-display': 'json-schema-display',
  'json-structure': 'json-structure',
  lexical: 'lexical',
  markdown: 'markdown',
  monaco: 'monaco',
  prosemirror: 'prosemirror',
  tailwind: 'tailwind',
}

const MODULE_DISPLAY: Record<string, string> = {
  index: 'Main',
  auth: 'Auth',
  'better-auth': 'Better Auth',
  'json-schema': 'JSON Schema',
  'json-schema-display': 'JSON Schema Display',
  'json-structure': 'JSON Structure',
  lexical: 'Lexical',
  markdown: 'Markdown',
  monaco: 'Monaco',
  prosemirror: 'ProseMirror',
  tailwind: 'Tailwind',
}

const KIND_REFERENCE = 4194304

const KIND_ICONS: Record<number, string> = {
  64: 'function',       // Function
  256: 'interface',     // Interface
  128: 'class',         // Class
  2097152: 'type',      // TypeAlias
  32: 'variable',       // Variable
  8: 'enum',            // Enum
  4: 'namespace',       // Namespace
}

const KIND_LABELS: Record<number, string> = {
  64: 'Function',
  256: 'Interface',
  128: 'Class',
  2097152: 'Type Alias',
  32: 'Variable',
  8: 'Enum',
  4: 'Namespace',
}

interface ApiChild {
  name: string
  kind: number
  comment?: {
    summary?: Array<{ text: string }>
  }
}

interface ApiModule {
  name: string
  children?: ApiChild[]
}

function extractApiEntries(): SearchEntry[] {
  if (!fs.existsSync(API_JSON)) {
    console.log('[search-index] No api.json found, skipping API indexing')
    return []
  }

  const raw = fs.readFileSync(API_JSON, 'utf-8')
  const project = JSON.parse(raw) as { children: ApiModule[] }
  const entries: SearchEntry[] = []

  for (const mod of project.children) {
    const slug = MODULE_SLUGS[mod.name]
    if (!slug) continue
    const displayModule = MODULE_DISPLAY[mod.name] ?? mod.name

    for (const child of mod.children ?? []) {
      if (child.kind === KIND_REFERENCE) continue

      const summary = child.comment?.summary
        ?.map(p => p.text)
        .join('')
        .slice(0, 150)
        .trim()

      const kindLabel = KIND_LABELS[child.kind] ?? 'Symbol'
      const icon = KIND_ICONS[child.kind] ?? 'symbol'

      entries.push({
        type: 'api',
        name: child.name,
        url: `/api/${slug}/${child.name}`,
        category: `API: ${displayModule}`,
        description: summary || `${kindLabel} in ${displayModule}`,
        keywords: [kindLabel.toLowerCase(), displayModule.toLowerCase()],
        icon,
      })
    }
  }

  return entries
}

// --- Generation ---

function generate() {
  const guideEntries = extractGuideEntries()
  const componentEntries = extractComponentEntries()
  const apiEntries = extractApiEntries()
  const entries = [...guideEntries, ...componentEntries, ...apiEntries]

  const dir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(entries), 'utf-8')
  console.log(
    `[search-index] Generated index: ${guideEntries.length} guides + ${componentEntries.length} components + ${apiEntries.length} API symbols = ${entries.length} total`
  )
}

export function searchIndexPlugin(): Plugin {
  return {
    name: 'beatui-search-index',
    buildStart() {
      generate()
    },
    configureServer(server) {
      server.watcher.add(PAGES_DIR + '/**/*.ts')
      server.watcher.add(GUIDES_DIR + '/**/*.ts')
      server.watcher.on('change', (file: string) => {
        if (
          (file.startsWith(PAGES_DIR) || file.startsWith(GUIDES_DIR)) &&
          file.endsWith('.ts')
        ) {
          console.log('[search-index] Page changed, regenerating...')
          try {
            generate()
          } catch (e) {
            console.error('[search-index] Error regenerating:', e)
          }
        }
      })
    },
  }
}
