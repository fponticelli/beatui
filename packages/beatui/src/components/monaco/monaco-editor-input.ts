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

// Minimal runtime types to avoid depending on monaco types

type MinimalEditor = {
  focus(): unknown
  getValue: () => string
  setValue: (v: string) => void
  updateOptions: (opts: Record<string, unknown>) => void
  getModel: () => unknown
  onDidChangeModelContent: (cb: () => void) => { dispose: () => void }
  onDidBlurEditorText: (cb: () => void) => { dispose: () => void }
  dispose: () => void
}

type MinimalMonaco = {
  editor: {
    create: (el: HTMLElement, opts: Record<string, unknown>) => MinimalEditor
    setModelLanguage: (model: unknown, lang: string) => void
  }
  languages?: {
    json?: { jsonDefaults: { setDiagnosticsOptions: (opts: unknown) => void } }
  }
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

const isFunction = (v: unknown): v is (...args: unknown[]) => unknown =>
  typeof v === 'function'

function isMinimalMonaco(v: unknown): v is MinimalMonaco {
  if (!isObject(v)) return false
  const editor = v.editor
  if (!isObject(editor)) return false
  return isFunction(editor.create) && isFunction(editor.setModelLanguage)
}

function isMonacoYaml(v: unknown): v is MonacoYaml {
  if (!isObject(v)) return false
  return isFunction(v.setDiagnosticsOptions)
}

type MonacoYaml = { setDiagnosticsOptions: (opts: unknown) => void }

export type MonacoLanguage =
  | 'plaintext'
  | 'json'
  | 'yaml'
  | 'typescript'
  | 'javascript'
  | 'css'
  | 'html'
  | string

export type MonacoJSONSchema = {
  uri: string
  fileMatch: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any
}

export type MonacoYAMLSchema = MonacoJSONSchema

export type MonacoEditorSpecificOptions = {
  language?: Value<MonacoLanguage>
  editorOptions?: Record<string, unknown>
  jsonSchemas?: Value<MonacoJSONSchema[]> | undefined
  yamlSchemas?: Value<MonacoYAMLSchema[]> | undefined
  readOnly?: Value<boolean>
  // Optional fetcher for external schemas (used for YAML via schemaRequestService and JSON via prefetch)
  schemaRequest?:
    | Value<((url: string) => Promise<string>) | undefined>
    | ((url: string) => Promise<string>)
    | undefined
}

export type MonacoEditorInputOptions = Merge<
  InputOptions<string>,
  MonacoEditorSpecificOptions
>

// Ensure language contributions are loaded before using language features
const ensureLanguage = async (l: string) => {
  const langName = l.toLowerCase()
  try {
    if (langName === 'json' || langName === 'yaml') {
      await import('monaco-editor/esm/vs/language/json/monaco.contribution')
    } else if (langName === 'css') {
      await import('monaco-editor/esm/vs/language/css/monaco.contribution')
    } else if (langName === 'html') {
      await import('monaco-editor/esm/vs/language/html/monaco.contribution')
    } else if (langName === 'typescript' || langName === 'javascript') {
      await import(
        'monaco-editor/esm/vs/language/typescript/monaco.contribution'
      )
    }
    // yaml is handled by monaco-yaml below
  } catch (e) {
    // Best effort; if contribution missing, editor still works
    console.warn(
      '[BeatUI] Failed to load monaco language contribution',
      langName,
      e
    )
  }
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
          const monacoMod: unknown = await import(
            'monaco-editor/esm/vs/editor/editor.api'
          )
          const monaco =
            (monacoMod as { default?: unknown }).default ?? monacoMod
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

              if (lang === 'json') {
                monaco.languages?.json?.jsonDefaults.setDiagnosticsOptions({
                  validate: true,
                  schemas: schemasJson,
                })
              } else if (lang === 'yaml') {
                // monaco-yaml registers the YAML language and its worker
                const yamlMod: unknown = await import('monaco-yaml')
                const yamlCandidate =
                  (yamlMod as { default?: unknown }).default ?? yamlMod
                if (isMonacoYaml(yamlCandidate)) {
                  const fetcher =
                    typeof schemaRequest === 'function'
                      ? schemaRequest
                      : schemaRequest
                        ? Value.get(schemaRequest)
                        : undefined
                  const hasSchemas = !!(schemasYaml && schemasYaml.length)
                  const options: Record<string, unknown> = {
                    enableSchemaRequest: true,
                  }
                  if (fetcher) options.schemaRequestService = fetcher
                  if (hasSchemas) options.schemas = schemasYaml
                  yamlCandidate.setDiagnosticsOptions(options)
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
