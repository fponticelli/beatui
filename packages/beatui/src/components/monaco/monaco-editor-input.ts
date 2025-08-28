import {
  TNode,
  Value,
  WithElement,
  OnDispose,
  html,
  attr,
  Use,
  effectOf,
} from '@tempots/dom'
import type { InputOptions } from '../form/input/input-options'
import { debounce, Merge } from '@tempots/std'
import { Theme } from '../theme'
import { MonacoEditorSpecificOptions } from '@/monaco/types'
import { loadMonacoWithLanguage } from '@/monaco/lazy-loader'
import type * as Monaco from 'monaco-editor'

// Load component CSS on demand when the editor mounts (kept out of the main CSS bundle)
const loadCssOnce = (href: string) => {
  if (typeof document === 'undefined') return
  if (document.querySelector(`link[data-beatui-css="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  link.setAttribute('data-beatui-css', href)
  document.head.appendChild(link)
}

export type MonacoEditorInputOptions = Merge<
  InputOptions<string>,
  MonacoEditorSpecificOptions
>

/**
 * MonacoEditorInput mounts a Monaco editor in an InputContainer and wires its value to BeatUI inputs.
 * Note: This component dynamically imports 'monaco-editor' at runtime and does not include it in the main bundle.
 */
export const MonacoEditorInput = (options: MonacoEditorInputOptions): TNode => {
  const {
    value,
    onChange,
    onBlur,
    language = 'plaintext',
    readOnly = false,
    editorOptions,
    jsonSchemas,

    autofocus,
    class: cls,
    disabled,
    hasError,
    id,
    name,
    placeholder,
  } = options

  /*
  Options not implemented: after, autocomplete, before, required, onInput
  */

  const resolvedReadonly = Value.toSignal(readOnly)

  return Use(Theme, ({ appearance }) =>
    html.div(
      attr.class('bc-monaco-editor-container'),
      attr.class(cls),
      attr.class(
        Value.map(hasError ?? false, (e): string =>
          e ? 'bc-input-container--error' : ''
        )
      ),
      attr.id(id),
      attr.name(name),
      WithElement(container => {
        let loadingEditor: Monaco.editor.IStandaloneCodeEditor | null = null
        const disposers = [] as (() => void)[]

        const mount = async () => {
          // Ensure editor CSS is loaded only when this component mounts
          loadCssOnce(new URL('./monaco-editor.css', import.meta.url).href)
          try {
            // Get initial language for loading appropriate features
            const initialLanguage = Value.get(language) ?? 'plaintext'

            // Load Monaco with language-specific features
            const monaco = await loadMonacoWithLanguage(initialLanguage)

            loadingEditor = monaco.editor.create(container as HTMLElement, {
              value: Value.get(value) ?? '',
              language: initialLanguage,
              readOnly: Value.get(resolvedReadonly) ?? false,
              automaticLayout: true,
              minimap: { enabled: false },
              ...(editorOptions ?? {}),
            })

            if (!loadingEditor) {
              throw new Error('Failed to create Monaco editor')
            }

            const editor = loadingEditor!

            disposers.push(
              effectOf(
                language,
                jsonSchemas
              )(async (lang, schemasJson) => {
                // Load language-specific features when language changes
                const monaco = await loadMonacoWithLanguage(lang)

                if (lang === 'json') {
                  const hasSchemas = !!(schemasJson && schemasJson.length)
                  const options: Monaco.languages.json.DiagnosticsOptions = {
                    validate: true,
                    enableSchemaRequest: true,
                    schemas: hasSchemas ? schemasJson : [],
                  }
                  // Important: Do not pass functions (e.g. schemaRequestService) here,
                  // they are not structured-cloneable and will break postMessage to the worker.
                  monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
                    options
                  )
                }

                const model = editor.getModel()
                if (model) {
                  monaco.editor.setModelLanguage(model, lang)
                }
              })
            )

            function updateValue() {
              const v = editor.getValue()
              onChange?.(v)
            }

            // Forward content changes
            disposers.push(
              editor.onDidChangeModelContent(debounce(500, updateValue)).dispose
            )

            // Forward blur
            disposers.push(
              editor.onDidBlurEditorText(() => {
                updateValue()
                onBlur?.()
              }).dispose
            )

            // React to external value changes
            disposers.push(
              Value.on(value, v => {
                if (v !== editor.getValue()) editor.setValue(v ?? '')
              })
            )

            // React to readOnly changes
            disposers.push(
              Value.on(resolvedReadonly, ro => {
                editor.updateOptions({ readOnly: ro ?? false })
              })
            )

            // React to disabled changes
            disposers.push(
              Value.on(disabled ?? false, d => {
                editor.updateOptions({ readOnly: d ?? false })
              })
            )

            // Use focus if autofocus is set
            disposers.push(
              Value.on(autofocus ?? false, a => {
                if (a) editor.focus()
              })
            )

            // Use placeholder if provided
            disposers.push(
              Value.on(placeholder ?? '', p => {
                editor.updateOptions({ placeholder: p ?? '' })
              })
            )

            // Apply appearance
            disposers.push(
              appearance.on(a => {
                editor.updateOptions({ theme: a === 'dark' ? 'vs-dark' : 'vs' })
              })
            )
          } catch (err) {
            console.error('[BeatUI] Failed to initialize Monaco editor:', err)
            const el = container as HTMLElement
            el.textContent =
              'Failed to load Monaco Editor. Please ensure monaco-editor is installed.'
          }
        }

        mount()

        return OnDispose(() => {
          try {
            disposers.forEach(dispose => dispose())
          } catch {}
          try {
            loadingEditor?.dispose()
          } catch {}
        })
      })
    )
  )
}
