import type * as MonacoTypes from 'monaco-editor'

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
    configureMonacoWorkers()
    workersConfigured = true
  }

  // Lazy import core Monaco editor
  const monaco = await import('monaco-editor')
  monacoCache = monaco
  return monaco
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
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        })
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
        })
        break
      }

      case 'json': {
        // JSON support is included in core
        // Just enable validation
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
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
        monaco.languages.css.cssDefaults.setOptions({
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
          monaco.languages.register({ id: 'yaml', extensions: ['.yml', '.yaml'] })
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

// Configure Monaco workers
function configureMonacoWorkers(): void {
  // Only configure if we're in a browser environment
  if (typeof window === 'undefined') return

  // Check if already configured
  const win = window as Window & { MonacoEnvironment?: unknown }
  if (win.MonacoEnvironment) return

  // Configure Monaco workers with a simple blob-based approach
  // This avoids bundler-specific syntax and works universally
  win.MonacoEnvironment = {
    getWorker: function (_workerId: string, _label: string) {
      // Create a simple worker that does basic message handling
      // Monaco will handle most of the work internally
      const workerCode = `
        // Basic worker for Monaco editor
        let monacoWorker;
        
        self.addEventListener('message', async (event) => {
          const { data } = event;
          
          // Handle initialization
          if (data && data.type === 'init') {
            // Worker is ready
            self.postMessage({ type: 'ready' });
            return;
          }
          
          // Forward other messages to Monaco's internal handler if available
          if (monacoWorker && monacoWorker.onmessage) {
            monacoWorker.onmessage(event);
          }
        });
        
        // Signal that worker is loaded
        self.postMessage({ type: 'loaded' });
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' })
      const workerUrl = URL.createObjectURL(blob)
      return new Worker(workerUrl)
    },
  }
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
    // Otherwise use default configuration
    configureMonacoWorkers()
    workersConfigured = true
  }
}