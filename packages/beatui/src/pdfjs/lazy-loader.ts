// CDN loader (no bundler config required)
const PDFJS_CDN_BASE = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.394/'

type WindowWithPDFJS = Window & {
  pdfjsLib?: unknown
}

const isMinimalPDFJS = (p: unknown): boolean => {
  if (!p || typeof p !== 'object') return false
  const o = p as { getDocument?: unknown; GlobalWorkerOptions?: unknown }
  return !!(o.getDocument && typeof o.getDocument === 'function')
}

function setupPDFJSWorker() {
  if (typeof window === 'undefined') return

  const w = window as unknown as WindowWithPDFJS
  const pdfjsLib = w.pdfjsLib as
    | { GlobalWorkerOptions?: { workerSrc?: string } }
    | undefined

  if (pdfjsLib?.GlobalWorkerOptions?.workerSrc) {
    // Worker already configured
    return
  }

  // Configure worker to use CDN
  if (pdfjsLib?.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN_BASE}build/pdf.worker.min.mjs`
  }
}

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

const requirePDFJSApi = async (): Promise<unknown> => {
  const w = window as unknown as WindowWithPDFJS
  if (w.pdfjsLib && isMinimalPDFJS(w.pdfjsLib)) return w.pdfjsLib

  // Load PDF.js from CDN
  await loadScript(`${PDFJS_CDN_BASE}build/pdf.min.mjs`)

  // Wait a bit for the global to be set
  await new Promise(resolve => setTimeout(resolve, 100))

  if (!w.pdfjsLib) {
    throw new Error('PDF.js failed to initialize after loading')
  }

  return w.pdfjsLib
}

// Cache for loaded PDF.js instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsCache: any | null = null

// Track if worker is configured
let workerConfigured = false

// Core PDF.js loader
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadPDFJSCore(): Promise<any> {
  if (pdfjsCache) {
    return pdfjsCache
  }

  // Configure worker before loading PDF.js
  if (!workerConfigured && typeof window !== 'undefined') {
    setupPDFJSWorker()
    workerConfigured = true
  }

  // Load PDF.js from CDN so consumers need no bundler config
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjsGlobal = (await requirePDFJSApi()) as any
  pdfjsCache = pdfjsGlobal

  // Configure worker after loading
  if (pdfjsGlobal.GlobalWorkerOptions) {
    pdfjsGlobal.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN_BASE}build/pdf.worker.min.mjs`
  }

  return pdfjsGlobal
}

// Helper to configure PDF.js worker (for consumers who want custom workers)
export function configurePDFJSWorker(workerSrc?: string): void {
  // Only configure if we're in a browser environment
  if (typeof window === 'undefined') return

  const w = window as unknown as WindowWithPDFJS
  const pdfjsLib = w.pdfjsLib as
    | { GlobalWorkerOptions?: { workerSrc?: string } }
    | undefined

  if (pdfjsLib?.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      workerSrc ?? `${PDFJS_CDN_BASE}build/pdf.worker.min.mjs`
    workerConfigured = true
  }
}
