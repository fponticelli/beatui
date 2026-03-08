import type { Plugin } from 'vite'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PAGES_DIR = path.resolve(__dirname, '../src/pages/components')
const GUIDES_DIR = path.resolve(__dirname, '../src/pages/guides')
const BEATUI_SRC = path.resolve(__dirname, '../../../packages/beatui/src')
const API_JSON = path.resolve(__dirname, '../public/api.json')
const OUTPUT_DIR = path.resolve(__dirname, '../public')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface PageMeta {
  name: string
  category?: string
  description: string
  component?: string
  slug: string
}

interface ComponentProp {
  name: string
  description: string
  type: string
  defaultValue?: string
  unionValues?: string[]
  reactive: boolean
  optional: boolean
}

interface ComponentMeta {
  name: string
  optionsType: string
  props: ComponentProp[]
}

function extractMeta(content: string): Omit<PageMeta, 'slug'> | null {
  const match = content.match(
    /export\s+const\s+meta\s*(?::\s*\w+)?\s*=\s*(\{[\s\S]*?\n\})/
  )
  if (!match) return null
  try {
    const objStr = match[1]
      .replace(/\/\/.*$/gm, '')
      .replace(/,\s*\}/g, '}')
    return new Function(`return ${objStr}`)()
  } catch {
    return null
  }
}

/** Extract string constants from a guide/component page source */
function extractCodeSamples(content: string): string[] {
  const samples: string[] = []
  const re = /const\s+\w+\s*=\s*`([\s\S]*?)`/g
  let m
  while ((m = re.exec(content)) !== null) {
    const code = m[1].trim()
    if (code.length > 20 && code.length < 3000) {
      samples.push(code)
    }
  }
  return samples
}

/** Extract Section() titles and descriptions from component page */
function extractSections(content: string): { title: string; description: string }[] {
  const sections: { title: string; description: string }[] = []
  const re = /\bSection\(\s*\n?\s*(['"`])((?:(?!\1).)*)\1/g
  let m
  while ((m = re.exec(content)) !== null) {
    const title = m[2]
    // Try to find description (last string arg of Section())
    const after = content.slice(m.index)
    let depth = 0
    let inStr = false
    let strChar = ''
    let i = 0
    for (; i < after.length; i++) {
      const c = after[i]
      if (inStr) {
        if (c === '\\') { i++; continue }
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
    const strs = [...fullCall.matchAll(/(['"])((?:(?!\1).)*?)\1/g)]
    const desc = strs.length > 1 ? strs[strs.length - 1][2] : ''
    sections.push({ title, description: desc })
  }
  return sections
}

// ---------------------------------------------------------------------------
// Data extraction
// ---------------------------------------------------------------------------

function getGuides(): PageMeta[] {
  if (!fs.existsSync(GUIDES_DIR)) return []
  return fs
    .readdirSync(GUIDES_DIR)
    .filter(f => f.endsWith('.ts') && !f.startsWith('_'))
    .sort()
    .map(f => {
      const content = fs.readFileSync(path.join(GUIDES_DIR, f), 'utf-8')
      const slug = f.replace(/\.ts$/, '')
      const meta = extractMeta(content)
      return {
        name: meta?.name ?? (meta as any)?.title ?? slug.replace(/-/g, ' '),
        description: meta?.description ?? '',
        slug,
      }
    })
}

function getComponents(): PageMeta[] {
  if (!fs.existsSync(PAGES_DIR)) return []
  return fs
    .readdirSync(PAGES_DIR)
    .filter(f => f.endsWith('.ts') && !f.startsWith('_'))
    .sort()
    .map(f => {
      const content = fs.readFileSync(path.join(PAGES_DIR, f), 'utf-8')
      const slug = f.replace(/\.ts$/, '')
      const meta = extractMeta(content)
      if (!meta) return null
      return {
        name: meta.name,
        category: meta.category,
        component: meta.component,
        description: meta.description ?? '',
        slug,
      }
    })
    .filter(Boolean) as PageMeta[]
}

function getComponentMeta(): Record<string, ComponentMeta> {
  const metaFile = path.resolve(__dirname, '../src/registry/component-meta.ts')
  if (!fs.existsSync(metaFile)) return {}
  const content = fs.readFileSync(metaFile, 'utf-8')
  const match = content.match(
    /export\s+const\s+componentMeta[^=]*=\s*\n(\{[\s\S]*\})\s*$/
  )
  if (!match) return {}
  try {
    return JSON.parse(match[1])
  } catch {
    return {}
  }
}

interface ApiSymbol {
  name: string
  kind: string
  module: string
  description: string
}

const KIND_LABELS: Record<number, string> = {
  64: 'function', 256: 'interface', 128: 'class',
  2097152: 'type', 32: 'variable', 8: 'enum', 4: 'namespace',
}

const MODULE_DISPLAY: Record<string, string> = {
  index: 'Main', auth: 'Auth', 'better-auth': 'Better Auth',
  'json-schema': 'JSON Schema', 'json-schema-display': 'JSON Schema Display',
  'json-structure': 'JSON Structure', lexical: 'Lexical',
  markdown: 'Markdown', monaco: 'Monaco', prosemirror: 'ProseMirror',
  tailwind: 'Tailwind',
}

function getApiSymbols(): ApiSymbol[] {
  if (!fs.existsSync(API_JSON)) return []
  try {
    const raw = JSON.parse(fs.readFileSync(API_JSON, 'utf-8'))
    const symbols: ApiSymbol[] = []
    for (const mod of raw.children ?? []) {
      const modName = MODULE_DISPLAY[mod.name] ?? mod.name
      for (const child of mod.children ?? []) {
        if (child.kind === 4194304) continue // Reference
        const kind = KIND_LABELS[child.kind] ?? 'symbol'
        const desc = child.comment?.summary?.map((p: any) => p.text).join('').slice(0, 200).trim() ?? ''
        symbols.push({ name: child.name, kind, module: modName, description: desc })
      }
    }
    return symbols
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// llms.txt generation (compact ~5-10K tokens)
// ---------------------------------------------------------------------------

function generateLlmsTxt(): string {
  const guides = getGuides()
  const components = getComponents()

  // Group components by category
  const byCategory = new Map<string, PageMeta[]>()
  for (const c of components) {
    const cat = c.category ?? 'Other'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(c)
  }

  const lines: string[] = []

  lines.push('# BeatUI')
  lines.push('')
  lines.push('> BeatUI is a comprehensive TypeScript UI component library built on the Tempo ecosystem (@tempots/dom) with fine-grained reactivity, theme support (light/dark), i18n, and full accessibility. Components are plain TypeScript functions — no JSX, no virtual DOM.')
  lines.push('')

  // Key info
  lines.push('BeatUI uses reactive signals (`Value<T>`, `prop()`) from `@tempots/dom` for fine-grained DOM updates. Components accept an options object as the first argument followed by children: `Button({ variant: \'filled\', size: \'md\' }, \'Click me\')`. All component props accept either static values or reactive `Value<T>` signals.')
  lines.push('')
  lines.push('CSS uses a layered architecture with `bc-` prefixed classes (e.g., `bc-button`, `bc-card`). Every component exposes CSS custom properties for theming (e.g., `--bc-button-border-radius`). Dark mode uses `.dark` class on `<html>`.')
  lines.push('')

  // Entry points
  lines.push('## Entry Points')
  lines.push('')
  lines.push('- [@tempots/beatui](https://github.com/fponticelli/beatui): Core components — buttons, forms, layout, overlays, data display, navigation')
  lines.push('- [@tempots/beatui/auth](https://github.com/fponticelli/beatui): Authentication UI — sign-in, sign-up, social login, two-factor')
  lines.push('- [@tempots/beatui/codehighlight](https://github.com/fponticelli/beatui): Syntax highlighting powered by Shiki')
  lines.push('- [@tempots/beatui/json-schema](https://github.com/fponticelli/beatui): Auto-generated forms from JSON Schema with AJV validation')
  lines.push('- [@tempots/beatui/json-structure](https://github.com/fponticelli/beatui): Auto-generated forms from a custom JSON structure format')
  lines.push('- [@tempots/beatui/lexical](https://github.com/fponticelli/beatui): Lexical rich text editor integration')
  lines.push('- [@tempots/beatui/monaco](https://github.com/fponticelli/beatui): Monaco code editor integration')
  lines.push('- [@tempots/beatui/prosemirror](https://github.com/fponticelli/beatui): ProseMirror rich text editor integration')
  lines.push('- [@tempots/beatui/markdown](https://github.com/fponticelli/beatui): Markdown rendering with GFM support')
  lines.push('- [@tempots/beatui/tailwind](https://github.com/fponticelli/beatui): Tailwind CSS v4 preset and Vite plugin')
  lines.push('')

  // Guides
  lines.push('## Guides')
  lines.push('')
  for (const g of guides) {
    lines.push(`- [${g.name}](/guides/${g.slug}): ${g.description}`)
  }
  lines.push('')

  // Components by category
  for (const [cat, pages] of byCategory) {
    lines.push(`## ${cat}`)
    lines.push('')
    for (const p of pages) {
      lines.push(`- [${p.name}](/components/${p.slug}): ${p.description}`)
    }
    lines.push('')
  }

  // Optional API section
  lines.push('## Optional')
  lines.push('')
  lines.push('- [API Reference](/api): Full TypeScript API documentation for every exported symbol')
  lines.push('- [Full Documentation](/llms-full.txt): Complete documentation with usage examples and component prop details')
  lines.push('')

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// llms-full.txt generation (comprehensive)
// ---------------------------------------------------------------------------

function generateLlmsFullTxt(): string {
  const guides = getGuides()
  const components = getComponents()
  const componentMeta = getComponentMeta()
  const apiSymbols = getApiSymbols()

  const byCategory = new Map<string, PageMeta[]>()
  for (const c of components) {
    const cat = c.category ?? 'Other'
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(c)
  }

  const lines: string[] = []

  lines.push('# BeatUI — Full Documentation')
  lines.push('')
  lines.push('> BeatUI is a comprehensive TypeScript UI component library built on the Tempo ecosystem (@tempots/dom) with fine-grained reactivity, theme support (light/dark), i18n, RTL/LTR support, and full accessibility. Components are plain TypeScript functions — no JSX, no virtual DOM, no framework-specific wrappers.')
  lines.push('')

  // Core concepts
  lines.push('## Core Concepts')
  lines.push('')
  lines.push('### Reactive Primitives')
  lines.push('')
  lines.push('BeatUI is built on `@tempots/dom` which provides fine-grained reactivity:')
  lines.push('')
  lines.push('- `Value<T>` — A reactive value that can be static or a signal')
  lines.push('- `prop<T>(initial)` — Creates a mutable reactive signal')
  lines.push('- `computedOf(a, b)(fn)` — Derives a computed value from multiple signals')
  lines.push('- `html.*` — Element factories (`html.div`, `html.button`, etc.)')
  lines.push('- `attr.*`, `style.*`, `on.*` — Attribute, style, and event bindings')
  lines.push('- `When(condition, trueNode, falseNode)` — Conditional rendering')
  lines.push('- `MapSignal(signal, fn)` — Reactive child rendering')
  lines.push('- `Fragment(...nodes)` — Groups multiple nodes')
  lines.push('- `Empty` — Renders nothing')
  lines.push('')
  lines.push('### Component Pattern')
  lines.push('')
  lines.push('```typescript')
  lines.push('import { Button, Stack, TextInput } from \'@tempots/beatui\'')
  lines.push('import { html, attr, prop } from \'@tempots/dom\'')
  lines.push('')
  lines.push('// Components accept options + children')
  lines.push('Button({ variant: \'filled\', color: \'primary\', size: \'md\' }, \'Click me\')')
  lines.push('')
  lines.push('// Props can be reactive signals')
  lines.push('const name = prop(\'\')')
  lines.push('TextInput({ value: name, onInput: v => name.set(v), placeholder: \'Name\' })')
  lines.push('')
  lines.push('// Compose freely — components are just functions returning TNode')
  lines.push('Stack(')
  lines.push('  attr.class(\'gap-4 p-6\'),')
  lines.push('  TextInput({ value: name, onInput: v => name.set(v) }),')
  lines.push('  Button({ variant: \'filled\' }, \'Submit\')')
  lines.push(')')
  lines.push('```')
  lines.push('')

  lines.push('### App Setup')
  lines.push('')
  lines.push('```typescript')
  lines.push('import { render } from \'@tempots/dom\'')
  lines.push('import { BeatUI } from \'@tempots/beatui\'')
  lines.push('')
  lines.push('// BeatUI() provides theme, locale, i18n, and notification providers')
  lines.push('render(BeatUI({}, YourApp()), document.getElementById(\'app\')!)')
  lines.push('```')
  lines.push('')

  lines.push('### CSS Setup (Tailwind v4)')
  lines.push('')
  lines.push('```typescript')
  lines.push('// vite.config.ts')
  lines.push('import tailwindcss from \'@tailwindcss/vite\'')
  lines.push('import { beatuiTailwindPlugin } from \'@tempots/beatui/tailwind/vite-plugin\'')
  lines.push('')
  lines.push('export default defineConfig({')
  lines.push('  plugins: [')
  lines.push('    tailwindcss(),')
  lines.push('    beatuiTailwindPlugin({')
  lines.push('      semanticColors: { primary: \'sky\', secondary: \'cyan\' },')
  lines.push('    }),')
  lines.push('  ],')
  lines.push('})')
  lines.push('```')
  lines.push('')
  lines.push('```css')
  lines.push('/* main.css */')
  lines.push('@import \'tailwindcss\';')
  lines.push('@custom-variant dark (&:is(.dark *));')
  lines.push('```')
  lines.push('')

  lines.push('### Theme Access')
  lines.push('')
  lines.push('```typescript')
  lines.push('import { Use } from \'@tempots/dom\'')
  lines.push('import { Theme } from \'@tempots/beatui\'')
  lines.push('')
  lines.push('Use(Theme, ({ appearance }) =>')
  lines.push('  html.div(appearance.map(a => `Current theme: ${a}`))')
  lines.push(')')
  lines.push('```')
  lines.push('')

  lines.push('### Form System')
  lines.push('')
  lines.push('```typescript')
  lines.push('import { useForm, Control, TextInput } from \'@tempots/beatui\'')
  lines.push('import { z } from \'zod\'')
  lines.push('')
  lines.push('const { controller } = useForm({')
  lines.push('  schema: z.object({')
  lines.push('    name: z.string().min(1),')
  lines.push('    email: z.string().email(),')
  lines.push('  }),')
  lines.push('  validationMode: \'eager\',')
  lines.push('  initialValue: { name: \'\', email: \'\' },')
  lines.push('})')
  lines.push('')
  lines.push('const ctrl = controller.object()')
  lines.push('Control(TextInput, { controller: ctrl.field(\'name\'), label: \'Name\' })')
  lines.push('Control(TextInput, { controller: ctrl.field(\'email\'), label: \'Email\' })')
  lines.push('```')
  lines.push('')

  // Entry points
  lines.push('## Entry Points')
  lines.push('')
  lines.push('| Import | Description |')
  lines.push('|--------|-------------|')
  lines.push('| `@tempots/beatui` | Core components: buttons, forms, layout, overlays, data display, navigation |')
  lines.push('| `@tempots/beatui/auth` | Authentication UI: sign-in, sign-up, social login, two-factor, passkeys |')
  lines.push('| `@tempots/beatui/codehighlight` | Syntax highlighting powered by Shiki (separate bundle) |')
  lines.push('| `@tempots/beatui/json-schema` | Auto-generated forms from JSON Schema with AJV validation |')
  lines.push('| `@tempots/beatui/json-structure` | Auto-generated forms from a custom JSON structure schema |')
  lines.push('| `@tempots/beatui/lexical` | Lexical rich text editor (BareEditor, DockedEditor, ContextualEditor) |')
  lines.push('| `@tempots/beatui/monaco` | Monaco code editor integration |')
  lines.push('| `@tempots/beatui/prosemirror` | ProseMirror rich text editor |')
  lines.push('| `@tempots/beatui/markdown` | Markdown rendering with GFM support |')
  lines.push('| `@tempots/beatui/tailwind` | Tailwind CSS v4 preset and Vite plugin |')
  lines.push('')

  // Guides (include code samples)
  lines.push('## Guides')
  lines.push('')
  for (const g of guides) {
    lines.push(`### ${g.name}`)
    lines.push('')
    lines.push(g.description)
    lines.push('')

    // Extract code samples from guide source
    const filePath = path.join(GUIDES_DIR, `${g.slug}.ts`)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const samples = extractCodeSamples(content)
      if (samples.length > 0) {
        // Include first 3 most relevant code samples
        for (const sample of samples.slice(0, 3)) {
          const lang = sample.includes('import ') || sample.includes('const ') ? 'typescript' : sample.includes('{') && sample.includes(':') && !sample.includes('function') ? 'css' : 'typescript'
          lines.push('```' + lang)
          lines.push(sample)
          lines.push('```')
          lines.push('')
        }
      }
    }
  }

  // Components with full prop details
  lines.push('## Components')
  lines.push('')

  for (const [cat, pages] of byCategory) {
    lines.push(`### ${cat}`)
    lines.push('')

    for (const p of pages) {
      lines.push(`#### ${p.name}`)
      lines.push('')
      lines.push(p.description)
      lines.push('')

      // Include prop details from component-meta
      const meta = p.component ? componentMeta[p.component] : undefined
      if (meta && meta.props.length > 0) {
        lines.push('**Props** (`' + meta.optionsType + '`):')
        lines.push('')
        lines.push('| Prop | Type | Default | Description |')
        lines.push('|------|------|---------|-------------|')
        for (const prop of meta.props) {
          const type = prop.unionValues
            ? prop.unionValues.map(v => `'${v}'`).join(' \\| ')
            : prop.type
          const def = prop.defaultValue ?? (prop.optional ? '—' : 'required')
          const reactive = prop.reactive ? ' *(reactive)*' : ''
          const desc = (prop.description || '—').replace(/\n/g, ' ').slice(0, 120)
          lines.push(`| ${prop.name} | ${type} | ${def} | ${desc}${reactive} |`)
        }
        lines.push('')
      }

      // Include section titles from component page
      const filePath = path.join(PAGES_DIR, `${p.slug}.ts`)
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        const sections = extractSections(content)
        if (sections.length > 0) {
          lines.push('**Sections:** ' + sections.map(s => s.title).join(', '))
          lines.push('')
        }
      }
    }
  }

  // API symbols summary
  if (apiSymbols.length > 0) {
    lines.push('## API Reference')
    lines.push('')

    // Group by module
    const byModule = new Map<string, ApiSymbol[]>()
    for (const s of apiSymbols) {
      if (!byModule.has(s.module)) byModule.set(s.module, [])
      byModule.get(s.module)!.push(s)
    }

    for (const [mod, symbols] of byModule) {
      lines.push(`### ${mod}`)
      lines.push('')
      for (const s of symbols) {
        const desc = s.description ? ` — ${s.description}` : ''
        lines.push(`- \`${s.name}\` (${s.kind})${desc}`)
      }
      lines.push('')
    }
  }

  // Notes for LLMs
  lines.push('## Notes')
  lines.push('')
  lines.push('- BeatUI is built on `@tempots/dom`, NOT React, Vue, or Svelte. Do not use JSX syntax.')
  lines.push('- Components are plain TypeScript functions that return `TNode` or `Renderable`.')
  lines.push('- Use `prop()` for mutable state, `Value<T>` for read-only reactive values.')
  lines.push('- Use `When(condition, trueNode, falseNode)` for conditional rendering, NOT ternaries inside templates.')
  lines.push('- Use `MapSignal(signal, fn)` for reactive lists, NOT `.map()` on arrays directly.')
  lines.push('- The `BeatUI()` wrapper provides Theme, Locale, I18n, and NotificationService providers.')
  lines.push('- CSS class prefix is `bc-` (e.g., `bc-button`, `bc-card`). Override with CSS custom properties.')
  lines.push('- Dark mode: `.dark` class on `<html>`. Access via `Use(Theme, ({ appearance }) => ...)`.')
  lines.push('- Heavy dependencies (Shiki, Monaco, Lexical, ProseMirror) are in separate entry points to keep the core bundle small.')
  lines.push('- Button variants: `filled`, `light`, `outline`, `dashed`, `default`, `subtle`, `text`.')
  lines.push('- Common sizes: `xs`, `sm`, `md`, `lg`, `xl`.')
  lines.push('- Theme colors: `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `base`.')
  lines.push('')

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

function generate() {
  const llmsTxt = generateLlmsTxt()
  const llmsFullTxt = generateLlmsFullTxt()

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'llms.txt'), llmsTxt, 'utf-8')
  fs.writeFileSync(path.join(OUTPUT_DIR, 'llms-full.txt'), llmsFullTxt, 'utf-8')

  const llmsSize = (Buffer.byteLength(llmsTxt) / 1024).toFixed(1)
  const fullSize = (Buffer.byteLength(llmsFullTxt) / 1024).toFixed(1)
  console.log(
    `[llms-txt] Generated llms.txt (${llmsSize}KB) and llms-full.txt (${fullSize}KB)`
  )
}

export function llmsTxtPlugin(): Plugin {
  return {
    name: 'beatui-llms-txt',
    buildStart() {
      generate()
    },
    configureServer(server) {
      // Regenerate when component/guide pages change
      server.watcher.add(PAGES_DIR + '/**/*.ts')
      server.watcher.add(GUIDES_DIR + '/**/*.ts')
      server.watcher.on('change', (file: string) => {
        if (
          (file.startsWith(PAGES_DIR) || file.startsWith(GUIDES_DIR)) &&
          file.endsWith('.ts')
        ) {
          console.log('[llms-txt] Pages changed, regenerating...')
          try {
            generate()
          } catch (e) {
            console.error('[llms-txt] Error regenerating:', e)
          }
        }
      })
    },
  }
}
