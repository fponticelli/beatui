/**
 * Monaco Editor integration component for BeatUI forms.
 *
 * Provides a rich code editor powered by Monaco Editor (VS Code's editor)
 * that integrates with BeatUI's reactive form system, theming, and
 * CSS injection strategy.
 *
 * @module
 */

import {
  Renderable,
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
import { MonacoEditorSpecificOptions } from '../../monaco/types'
import { loadMonacoWithLanguage } from '../../monaco/lazy-loader'
import type * as Monaco from 'monaco-editor'
import { Task } from '@tempots/dom'
import { LinkPortal } from '../misc/link-portal'

/**
 * Options for the {@link MonacoEditorInput} component.
 *
 * Merges standard BeatUI {@link InputOptions} with Monaco-specific settings
 * such as `language`, `editorOptions`, and `jsonSchemas`.
 *
 * @example
 * ```ts
 * const options: MonacoEditorInputOptions = {
 *   value: prop('{}'),
 *   onChange: v => console.log(v),
 *   language: 'json',
 *   editorOptions: { minimap: { enabled: false } },
 *   cssInjection: 'link',
 * }
 * ```
 */
export type MonacoEditorInputOptions = Merge<
  InputOptions<string>,
  MonacoEditorSpecificOptions & {
    /**
     * CSS injection strategy for the Monaco editor stylesheet.
     * - `'link'`: Lazily inject a `<link>` element pointing to the CSS asset.
     * - `'none'`: Do not inject any CSS (the consumer manages styles).
     * @default 'none'
     */
    cssInjection?: 'link' | 'none'
  }
>

/**
 * Mounts a Monaco (VS Code) editor inside a BeatUI form input container and
 * wires its value to the reactive `InputOptions` interface.
 *
 * Monaco Editor is loaded lazily via CDN at runtime, so it is **not** included
 * in the main library bundle. Language-specific features (validation, schemas)
 * are also loaded on demand based on the `language` option.
 *
 * The component reacts to:
 * - External `value` changes (syncs content into the editor)
 * - `readOnly` / `disabled` changes
 * - `language` and `jsonSchemas` changes (reconfigures validation)
 * - Theme `appearance` changes (switches between VS light/dark themes)
 *
 * @param options - Configuration merging standard BeatUI input options with Monaco-specific settings.
 * @returns A `Renderable` containing the Monaco editor.
 *
 * @example
 * ```ts
 * const code = prop('console.log("hello")')
 *
 * MonacoEditorInput({
 *   value: code,
 *   onChange: v => code.set(v),
 *   language: 'javascript',
 *   readOnly: false,
 * })
 * ```
 */
export const MonacoEditorInput = (
  options: MonacoEditorInputOptions
): Renderable => {
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
      (options.cssInjection ?? 'none') === 'none'
        ? null
        : Task(
            () => import('../../monaco/styles-url'),
            ({ default: href }) => LinkPortal({ id: 'beatui-monaco-css', href })
          ),
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
          // Styles are declared via StylePortal above; proceed to monaco setup
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
                  const options: Monaco.json.DiagnosticsOptions = {
                    validate: true,
                    enableSchemaRequest: true,
                    schemas: hasSchemas ? schemasJson : [],
                  }
                  // Important: Do not pass functions (e.g. schemaRequestService) here,
                  // they are not structured-cloneable and will break postMessage to the worker.
                  monaco.json.jsonDefaults.setDiagnosticsOptions(options)
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
