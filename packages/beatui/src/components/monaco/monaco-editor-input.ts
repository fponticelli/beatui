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
import './monaco-editor.css'
import { Theme } from '../theme'
import { MinimalEditor, MonacoEditorSpecificOptions } from '@/monaco/types'
import { requireMonacoApi, loadMonacoYaml, setupMonacoEnvironment } from '@/monaco/loader'
import { isMinimalMonaco } from '@/monaco/utils'

export type MonacoEditorInputOptions = Merge<
  InputOptions<string>,
  MonacoEditorSpecificOptions
>

// Ensure language contributions are loaded before using language features
const ensureLanguage = async (_l: string) => {
  // Languages are automatically loaded with editor.main in the minified version
  // We don't need to load them separately from CDN
  // The language support is already included when we load editor.main
  return
}

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
    yamlSchemas,
    autofocus,
    class: cls,
    disabled,
    hasError,
    id,
    name,
    placeholder,
    schemaRequest,
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
        let loadingEditor: MinimalEditor | null = null
        const disposers = [] as (() => void)[]

        const mount = async () => {
          // Note: We avoid importing monaco types to keep them out of our public d.ts and bundle.
          // Dynamic import ensures consumers opt-in by installing monaco-editor themselves.
          const monacoMod: unknown = await requireMonacoApi()
          const monaco = monacoMod
          if (!isMinimalMonaco(monaco)) {
            console.warn(
              '[BeatUI] Invalid monaco module shape. Did you install monaco-editor?'
            )
            return
          }

          loadingEditor = monaco.editor.create(container as HTMLElement, {
            value: Value.get(value) ?? '',
            language: Value.get(language) ?? 'plaintext',
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
              jsonSchemas,
              yamlSchemas
            )(async (lang, schemasJson, schemasYaml) => {
              await ensureLanguage(lang)
              console.log(lang)

              if (lang === 'json') {
                const fetcher =
                  typeof schemaRequest === 'function'
                    ? schemaRequest
                    : schemaRequest
                      ? Value.get(schemaRequest)
                      : undefined
                const hasSchemas = !!(schemasJson && schemasJson.length)
                const options: Record<string, unknown> = {
                  validate: true,
                  enableSchemaRequest: true,
                }
                if (fetcher) options.schemaRequestService = fetcher
                if (hasSchemas) options.schemas = schemasJson
                monaco.languages?.json?.jsonDefaults.setDiagnosticsOptions(
                  options
                )
              } else if (lang === 'yaml') {
                // Load monaco-yaml from CDN
                try {
                  // Ensure Monaco environment is set up for YAML workers
                  setupMonacoEnvironment()
                  
                  const yamlMod: unknown = await loadMonacoYaml()
                  console.log('[BeatUI] Loaded monaco-yaml module:', yamlMod)
                  
                  // Find the configureMonacoYaml function
                  const mod = yamlMod as Record<string, unknown>
                  let configureMonacoYaml: ((monaco: unknown, opts: unknown) => void) | undefined
                  
                  if (typeof mod?.configureMonacoYaml === 'function') {
                    configureMonacoYaml = mod.configureMonacoYaml as (monaco: unknown, opts: unknown) => void
                  } else if (mod?.default && typeof (mod.default as Record<string, unknown>)?.configureMonacoYaml === 'function') {
                    configureMonacoYaml = (mod.default as Record<string, unknown>).configureMonacoYaml as (monaco: unknown, opts: unknown) => void
                  }
                  
                  if (configureMonacoYaml) {
                    const hasSchemas = !!(schemasYaml && schemasYaml.length)
                    
                    const options: Record<string, unknown> = {
                      enableSchemaRequest: true,
                      validate: true,
                      completion: true,
                      hover: true,
                    }
                    
                    if (hasSchemas) {
                      options.schemas = schemasYaml
                    }
                    
                    // Note: monaco-yaml uses enableSchemaRequest for remote schema loading
                    // Custom schemaRequest functions are not directly supported
                    
                    console.log('[BeatUI] Configuring monaco-yaml with options:', options)
                    configureMonacoYaml(monaco, options)
                  } else {
                    console.warn('[BeatUI] monaco-yaml loaded but configureMonacoYaml not found')
                  }
                } catch (error) {
                  console.warn('[BeatUI] YAML support not available:', error)
                }
              }

              const model = editor.getModel()
              monaco.editor.setModelLanguage(model, lang)
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
        }

        mount().catch(err => {
          try {
            // Surface a helpful message instead of throwing at runtime if monaco is not installed
            console.warn('[BeatUI] Monaco editor not available:', err)
            const el = container as HTMLElement
            el.textContent =
              'Monaco Editor not available. Please install monaco-editor (and monaco-yaml for YAML) in your app to enable this component.'
          } catch {}
        })

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
