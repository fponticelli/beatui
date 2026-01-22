import type * as MonacoTypes from 'monaco-editor'
// AMD + CDN loader (no bundler config required)
const MONACO_CDN_BASE = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/'

type WindowWithRequire = Window & {
  require?: {
    (
      deps: string[],
      onLoad: (...mods: unknown[]) => void,
      onError?: (err: unknown) => void
    ): void
    config?: (cfg: Record<string, unknown>) => void
  }
  monaco?: unknown
}

const isMinimalMonaco = (m: unknown): boolean => {
  if (!m || typeof m !== 'object') return false
  const o = m as { editor?: { create?: unknown }; languages?: unknown }
  return !!(o.editor && typeof o.editor.create === 'function' && o.languages)
}

function setupMonacoEnvironment() {
  if (typeof self === 'undefined') return
  const env = (self as unknown as { MonacoEnvironment?: unknown })
    .MonacoEnvironment as
    | { getWorkerUrl?: unknown; getWorker?: unknown }
    | undefined
  if (
    env &&
    (typeof env.getWorkerUrl === 'function' ||
      typeof env.getWorker === 'function')
  ) {
    return
  }
  const getMonacoWorkerUrl = () => {
    const workerScript = [
      `self.MonacoEnvironment = { baseUrl: '${MONACO_CDN_BASE}' };`,
      `importScripts('${MONACO_CDN_BASE}vs/base/worker/workerMain.js');`,
    ].join('\n')
    const blob = new Blob([workerScript], { type: 'text/javascript' })
    return URL.createObjectURL(blob)
  }
  ;(
    self as unknown as {
      MonacoEnvironment: {
        getWorkerUrl: (moduleId: string, label: string) => string
      }
    }
  ).MonacoEnvironment = {
    getWorkerUrl(_moduleId: string, _label: string) {
      return getMonacoWorkerUrl()
    },
  }
}

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.async = true
    const nonce = document.querySelector('script[nonce]')?.getAttribute('nonce')
    if (nonce) s.setAttribute('nonce', nonce)
    s.onload = () => resolve()
    s.onerror = ev => {
      console.error('[BeatUI] Failed to load script', src, ev)
      reject(new Error(`Failed to load script ${src}`))
    }
    document.head.appendChild(s)
  })

const ensureAmdLoader = async () => {
  const w = window as unknown as WindowWithRequire
  if (!w.require || !w.require.config) {
    await loadScript(`${MONACO_CDN_BASE}vs/loader.js`)
    await new Promise(resolve => setTimeout(resolve, 100))
    if (!w.require) throw new Error('AMD loader failed to initialize')
  }
  w.require!.config?.({ baseUrl: MONACO_CDN_BASE, paths: { vs: 'vs' } })
  return w.require!
}

const requireMonacoApi = async (): Promise<unknown> => {
  const w = window as unknown as WindowWithRequire
  if (w.monaco && isMinimalMonaco(w.monaco)) return w.monaco
  setupMonacoEnvironment()
  const req = await ensureAmdLoader()
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Timeout loading editor.main')),
      30000
    )
    try {
      req(
        ['vs/editor/editor.main'],
        () => {
          clearTimeout(timeout)
          resolve()
        },
        err => {
          clearTimeout(timeout)
          reject(err)
        }
      )
    } catch (e) {
      clearTimeout(timeout)
      reject(e)
    }
  })
  if (!w.monaco)
    throw new Error('Monaco failed to initialize after loading editor.main')
  return w.monaco
}

// Cache for loaded Monaco instance
let monacoCache: typeof MonacoTypes | null = null

// Language loader cache
const languageLoadersCache = new Map<string, Promise<void>>()

// Track if workers are configured
let workersConfigured = false

// Core Monaco loader
export async function loadMonacoCore(): Promise<typeof MonacoTypes> {
  if (monacoCache) {
    return monacoCache
  }

  // Configure workers before loading Monaco
  if (!workersConfigured && typeof window !== 'undefined') {
    setupMonacoEnvironment()
    workersConfigured = true
  }

  // Load Monaco via AMD from CDN so consumers need no bundler config
  const monacoGlobal =
    (await requireMonacoApi()) as unknown as typeof MonacoTypes
  monacoCache = monacoGlobal
  return monacoGlobal
}

// Language-specific loaders
export async function loadLanguageFeatures(language: string): Promise<void> {
  // Check cache first
  if (languageLoadersCache.has(language)) {
    return languageLoadersCache.get(language)!
  }

  // Create loader promise
  const loaderPromise = (async () => {
    const monaco = await loadMonacoCore()

    switch (language) {
      case 'typescript':
      case 'javascript': {
        // TypeScript/JavaScript support is included in core
        // Just configure the compiler options if needed
        monaco.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        })
        monaco.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        })
        break
      }

      case 'json': {
        // JSON support is included in core
        // Just enable validation
        monaco.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          schemas: [],
          enableSchemaRequest: true,
        })
        break
      }

      case 'css':
      case 'scss':
      case 'less': {
        // CSS support is included in core
        monaco.css.cssDefaults.setOptions({
          validate: true,
        })
        break
      }

      case 'html': {
        // HTML support is included in core
        // HTML validation is enabled by default
        break
      }

      case 'markdown': {
        // Markdown support is included in core
        // No additional configuration needed
        break
      }

      case 'yaml': {
        // YAML support is basic in Monaco core
        // For advanced YAML support, users can install monaco-yaml separately
        // Register YAML language if not already registered
        const languages = monaco.languages.getLanguages()
        if (!languages.some(lang => lang.id === 'yaml')) {
          monaco.languages.register({
            id: 'yaml',
            extensions: ['.yml', '.yaml'],
          })
        }
        break
      }

      case 'xml': {
        // XML support is included in core
        // No additional configuration needed
        break
      }

      case 'sql': {
        // SQL support is included in core
        // No additional configuration needed
        break
      }

      case 'python':
      case 'java':
      case 'csharp':
      case 'cpp':
      case 'c':
      case 'go':
      case 'rust':
      case 'php':
      case 'ruby':
      case 'swift':
      case 'kotlin': {
        // These languages have basic syntax highlighting in core
        // No additional configuration needed
        break
      }

      default:
        // For unknown languages, Monaco will use plaintext
        // No action needed
        break
    }
  })()

  // Cache the promise
  languageLoadersCache.set(language, loaderPromise)
  return loaderPromise
}

// Combined loader that loads Monaco and language features
export async function loadMonacoWithLanguage(
  language: string
): Promise<typeof MonacoTypes> {
  const [monaco] = await Promise.all([
    loadMonacoCore(),
    loadLanguageFeatures(language),
  ])
  return monaco
}

// Helper to configure Monaco environment (for consumers who want custom workers)
export function configureMonacoEnvironment(
  getWorkerFn?: (workerId: string, label: string) => Worker
): void {
  // Only configure if we're in a browser environment
  if (typeof window === 'undefined') return

  const win = window as Window & { MonacoEnvironment?: unknown }

  // If custom worker function provided, use it
  if (getWorkerFn) {
    win.MonacoEnvironment = {
      getWorker: getWorkerFn,
    }
    workersConfigured = true
  } else if (!win.MonacoEnvironment) {
    // Otherwise set up default AMD worker environment via setupMonacoEnvironment
    setupMonacoEnvironment()
    workersConfigured = true
  }
}
