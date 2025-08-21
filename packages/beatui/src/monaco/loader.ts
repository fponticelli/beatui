import { MONACO_CDN_BASE } from './config'
import { isMinimalMonaco } from './utils'

export function setupMonacoEnvironment() {
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

  const getMonacoWorker = () => {
    // For standard Monaco workers
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
        getWorker: (moduleId: string, label: string) => Worker
      }
    }
  ).MonacoEnvironment = {
    getWorker(_moduleId: string, _label: string) {
      return new Worker(getMonacoWorker(), { type: 'classic' })
    },
  }
}

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

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    // Check if script already exists
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }

    const s = document.createElement('script')
    s.src = src
    s.async = true
    // Remove crossOrigin to avoid CORS issues with some CDNs
    // s.crossOrigin = 'anonymous'

    // propagate CSP nonce if present on the page
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
    // loader attaches window.require
    // Wait a bit for the loader to initialize
    await new Promise(resolve => setTimeout(resolve, 100))

    // Check if require was properly loaded
    if (!w.require) {
      throw new Error('AMD loader failed to initialize')
    }
  }

  // Configure paths for 'vs' with proper base URL
  // IMPORTANT: Use baseUrl instead of paths to ensure all modules resolve from CDN
  w.require!.config?.({
    baseUrl: MONACO_CDN_BASE,
    paths: {
      vs: 'vs',
    },
  })

  return w.require!
}

const amdRequire = async <T = unknown>(deps: string[]): Promise<T | T[]> => {
  const req = await ensureAmdLoader()
  return new Promise<T | T[]>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout loading ${deps.join(', ')}`))
    }, 30000)

    try {
      req(
        deps,
        (...mods: unknown[]) => {
          clearTimeout(timeout)
          resolve(mods.length === 1 ? (mods[0] as T) : (mods as unknown as T[]))
        },
        (err: unknown) => {
          clearTimeout(timeout)
          console.error('[BeatUI] AMD require failed', {
            deps: deps.join('\n'),
            err,
          })
          reject(new Error(`AMD require failed for ${deps.join(', ')}`))
        }
      )
    } catch (e) {
      console.error(`Failed to require ${deps.join(', ')}, ${e}`)
      clearTimeout(timeout)
      reject(e)
    }
  })
}

export const requireMonacoApi = async (): Promise<unknown> => {
  // Check if Monaco is already loaded globally
  const w = window as unknown as WindowWithRequire
  if (w.monaco && isMinimalMonaco(w.monaco)) {
    return w.monaco
  }

  // Ensure Monaco workers are configured before loading editor.main
  setupMonacoEnvironment()

  // Load Monaco via AMD from CDN
  // Use editor.main which is the actual entry point
  await amdRequire(['vs/editor/editor.main'])

  // After loading editor.main, monaco is available globally
  if (!w.monaco) {
    throw new Error('Monaco failed to initialize after loading editor.main')
  }

  // Store reference and return
  const monaco = w.monaco
  return monaco
}
