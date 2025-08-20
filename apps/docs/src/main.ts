import { render } from '@tempots/dom'
import { App } from './app'
import './styles/main.css'

// Configure Monaco web workers for Vite dev/preview
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  interface Window {
    MonacoEnvironment?: {
      getWorker: (moduleId: string, label: string) => Worker
    }
  }
}

if (typeof window !== 'undefined') {
  window.MonacoEnvironment = {
    getWorker: (_moduleId: string, label: string) => {
      if (label === 'json') {
        return new Worker(
          new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url),
          { type: 'module' }
        )
      }
      if (label === 'css') {
        return new Worker(
          new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url),
          { type: 'module' }
        )
      }
      if (label === 'html') {
        return new Worker(
          new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url),
          { type: 'module' }
        )
      }
      if (label === 'typescript' || label === 'javascript') {
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/typescript/ts.worker.js',
            import.meta.url
          ),
          { type: 'module' }
        )
      }
      if (label === 'yaml') {
        // monaco-yaml provides its own worker
        return new Worker(new URL('monaco-yaml/yaml.worker.js', import.meta.url), {
          type: 'module',
        })
      }
      return new Worker(
        new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
        { type: 'module' }
      )
    },
  }
}

// Get the app container
const appElement = document.getElementById('app')

if (!appElement) {
  throw new Error('App element not found')
}

// Render the main app
render(App(), appElement)
