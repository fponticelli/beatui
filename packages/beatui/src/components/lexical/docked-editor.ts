import {
  Renderable,
  Value,
  WithElement,
  OnDispose,
  html,
  attr,
  Use,
  Task,
  When,
  prop,
  Signal,
} from '@tempots/dom'
import { Theme } from '../theme'
import { LinkPortal } from '../misc/link-portal'
import type {
  DockedEditorOptions,
  PluginConfig,
  ContentFormatType,
  JsonContent,
} from '../../lexical/types'
import {
  getNodesForPlugins,
  createDefaultPluginConfig,
} from '../../lexical/nodes'
import { registerRichTextPlugin } from '../../lexical/plugins/rich-text'
import { registerPlainTextPlugin } from '../../lexical/plugins/plain-text'
import { registerHistoryPlugin } from '../../lexical/plugins/history'
import { registerClipboardPlugin } from '../../lexical/plugins/clipboard'
import { registerListPlugin } from '../../lexical/plugins/list'
import { registerLinkPlugin } from '../../lexical/plugins/link'
import { registerYjsPlugin } from '../../lexical/plugins/yjs'
import { registerDragonPlugin } from '../../lexical/plugins/dragon'
import {
  exportToMarkdown,
  importFromMarkdown,
} from '../../lexical/plugins/markdown-io'
import { exportToHtml, importFromHtml } from '../../lexical/plugins/html-io'
import { registerTablePlugin } from '../../lexical/plugins/table'
import { registerHorizontalRulePlugin } from '../../lexical/plugins/horizontal-rule'
import {
  buildElementStyleExportMap,
  buildStyleImportMap,
  registerElementStylePlugin,
} from '../../lexical/plugins/element-style'
import { LexicalToolbar } from './toolbar'
import { TableControls } from './table'
import {
  type LexicalEditor,
  createEditor,
  SELECTION_CHANGE_COMMAND,
  BLUR_COMMAND,
  COMMAND_PRIORITY_LOW,
} from 'lexical'

/**
 * DockedEditor - Rich text editor with a persistent toolbar
 *
 * Extends the BareEditor pattern by adding a configurable toolbar above
 * (or below) the editor surface. Includes all standard formatting groups:
 * text-formatting, headings, lists, blocks, links, and history.
 *
 * Default plugins: richText, history, clipboard, list, link
 *
 * @example
 * ```ts
 * const content = prop('')
 * DockedEditor({
 *   value: content,
 *   format: 'markdown',
 *   toolbar: { maxHeadingLevel: 3, hiddenGroups: ['tables'] },
 *   onInput: (value) => console.log('Input:', value),
 * })
 * ```
 */
export const DockedEditor = (options: DockedEditorOptions): Renderable => {
  const {
    value,
    format,
    plugins: pluginConfig,
    readOnly,
    placeholder: _placeholder,
    class: cls,
    namespace = 'BeatUILexical',
    heightMode = 'fixed',
    toolbar: toolbarConfig,
    autoFocus = false,
    onError,
    onInput,
    onChange,
    onBlur,
    onReady,
  } = options

  // Signals for toolbar integration
  const editorSignal = prop<LexicalEditor | null>(null)
  const stateUpdate = prop(0)

  // Check if readOnly is a Signal (has a map method) or a static value
  const isSignalLike = (
    v: Value<boolean>
  ): v is Signal<boolean> & {
    map: (fn: (v: boolean) => boolean) => Signal<boolean>
  } =>
    typeof v === 'object' &&
    v !== null &&
    'map' in v &&
    typeof (v as Signal<boolean>).map === 'function'

  const readOnlySignal: Signal<boolean> =
    readOnly != null
      ? isSignalLike(readOnly)
        ? readOnly
        : prop(Value.get(readOnly))
      : prop(false)

  return Use(Theme, ({ appearance }) =>
    html.div(
      // CSS injection via LinkPortal
      Task(
        () => import('../../lexical/styles-url'),
        ({ default: href }) => LinkPortal({ id: 'beatui-lexical-css', href })
      ),

      attr.class('bc-lexical-editor-container'),
      heightMode === 'fixed'
        ? attr.class('bc-lexical-editor-container--fixed')
        : null,
      attr.class(cls),

      // Toolbar (hidden in readOnly mode)
      When(
        readOnlySignal.map((ro: boolean) => !ro),
        () =>
          LexicalToolbar({
            editor: editorSignal,
            stateUpdate,
            toolbar: toolbarConfig,
            readOnly: readOnlySignal,
            size: 'sm',
          })
      ),

      // Table context menu (appears when cursor is in a table cell)
      TableControls({
        editor: editorSignal,
        stateUpdate,
        readOnly: readOnlySignal,
      }),

      // The editable surface
      html.div(
        attr.class('bc-lexical-editor'),
        attr.class(`bc-lexical-editor--${heightMode}`),
        attr.contenteditable(
          readOnly != null
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (Value.map(readOnly, (ro: boolean) => !ro) as any)
            : true
        ),
        readOnly != null
          ? attr.class(
              Value.map(readOnly, (ro): string =>
                ro ? 'bc-lexical-editor--readonly' : ''
              )
            )
          : null,

        WithElement(container => {
          let editorInstance: LexicalEditor | null = null
          const disposers: Array<() => void> = []

          const mount = async () => {
            try {
              // Resolve plugin config (use 'docked' defaults if not provided)
              const resolvedPlugins: PluginConfig =
                pluginConfig ?? createDefaultPluginConfig('docked')

              // Compute node list from plugin config
              const nodes = getNodesForPlugins(resolvedPlugins)

              // Resolve format
              const resolvedFormat: ContentFormatType = Value.get(
                format ?? 'markdown'
              ) as ContentFormatType

              // Create the editor
              const editor = createEditor({
                namespace,
                nodes,
                theme: {
                  heading: {
                    h1: 'bc-lexical-h1',
                    h2: 'bc-lexical-h2',
                    h3: 'bc-lexical-h3',
                    h4: 'bc-lexical-h4',
                    h5: 'bc-lexical-h5',
                    h6: 'bc-lexical-h6',
                  },
                  text: {
                    bold: 'bc-lexical-bold',
                    italic: 'bc-lexical-italic',
                    underline: 'bc-lexical-underline',
                    strikethrough: 'bc-lexical-strikethrough',
                    code: 'bc-lexical-code',
                  },
                  list: {
                    ul: 'bc-lexical-ul',
                    ol: 'bc-lexical-ol',
                    listitem: 'bc-lexical-li',
                    listitemChecked: 'bc-lexical-li-checked',
                    listitemUnchecked: 'bc-lexical-li-unchecked',
                  },
                  link: 'bc-lexical-link',
                  quote: 'bc-lexical-blockquote',
                  code: 'bc-lexical-code-block',
                  codeHighlight: {},
                  hashtag: 'bc-lexical-hashtag',
                  table: 'bc-lexical-table',
                  tableCell: 'bc-lexical-table-cell',
                  tableCellHeader: 'bc-lexical-table-cell-header',
                  tableRow: 'bc-lexical-table-row',
                  mark: 'bc-lexical-mark',
                  paragraph: 'bc-lexical-paragraph',
                },
                onError: error => {
                  if (onError) {
                    onError(error, editor)
                  } else {
                    console.error('[BeatUI Lexical]', error)
                  }
                },
                editable: readOnly ? !Value.get(readOnly) : true,
                html: {
                  export: buildElementStyleExportMap(),
                  import: buildStyleImportMap(),
                },
              })

              editorInstance = editor

              // Expose editor to toolbar
              editorSignal.set(editor)

              // Mount the editor to the DOM
              editor.setRootElement(container as HTMLElement)

              // Register plugins based on config
              const pluginPromises: Promise<() => void>[] = []

              if (resolvedPlugins.richText) {
                pluginPromises.push(registerRichTextPlugin(editor))
              } else if (resolvedPlugins.plainText) {
                pluginPromises.push(registerPlainTextPlugin(editor))
              }

              if (resolvedPlugins.history) {
                const historyOpts =
                  typeof resolvedPlugins.history === 'object'
                    ? resolvedPlugins.history
                    : undefined
                pluginPromises.push(registerHistoryPlugin(editor, historyOpts))
              }

              if (resolvedPlugins.clipboard) {
                pluginPromises.push(registerClipboardPlugin(editor))
              }

              if (resolvedPlugins.list) {
                pluginPromises.push(registerListPlugin(editor))
              }

              if (resolvedPlugins.link) {
                pluginPromises.push(registerLinkPlugin(editor))
              }

              if (resolvedPlugins.yjs) {
                pluginPromises.push(
                  registerYjsPlugin(editor, resolvedPlugins.yjs)
                )
              }

              if (resolvedPlugins.dragon) {
                pluginPromises.push(registerDragonPlugin(editor))
              }

              if (resolvedPlugins.table) {
                pluginPromises.push(registerTablePlugin(editor))
              }

              // Wait for all plugins to register
              const cleanups = await Promise.all(pluginPromises)
              cleanups.forEach(cleanup => {
                if (cleanup) disposers.push(cleanup)
              })

              // Register horizontal rule command handler
              disposers.push(registerHorizontalRulePlugin(editor))

              // Register element style plugin (syncs block-level styles to DOM)
              disposers.push(registerElementStylePlugin(editor))

              // Register selection change listener to update toolbar state
              disposers.push(
                editor.registerCommand(
                  SELECTION_CHANGE_COMMAND,
                  () => {
                    stateUpdate.set(stateUpdate.value + 1)
                    return false
                  },
                  COMMAND_PRIORITY_LOW
                )
              )

              // Also update toolbar on content changes
              disposers.push(
                editor.registerUpdateListener(
                  ({ editorState, dirtyElements, dirtyLeaves }) => {
                    if (dirtyElements.size > 0 || dirtyLeaves.size > 0) {
                      stateUpdate.set(stateUpdate.value + 1)
                    }

                    // Fire onInput callback
                    if (
                      onInput &&
                      (dirtyElements.size > 0 || dirtyLeaves.size > 0)
                    ) {
                      editorState.read(async () => {
                        if (resolvedFormat === 'markdown') {
                          const md = await exportToMarkdown(editor)
                          onInput(md as string & JsonContent, editor)
                        } else if (resolvedFormat === 'html') {
                          const htmlContent = await exportToHtml(editor)
                          onInput(htmlContent as string & JsonContent, editor)
                        } else if (resolvedFormat === 'json') {
                          onInput(
                            editorState.toJSON() as unknown as string &
                              JsonContent,
                            editor
                          )
                        }
                      })
                    }
                  }
                )
              )

              // Set initial content from value
              if (value != null) {
                const initialValue = Value.get(
                  value as Signal<string | JsonContent>
                )
                // Skip empty values but allow empty objects for JSON format
                const shouldLoad =
                  initialValue != null &&
                  (initialValue !== '' ||
                    (resolvedFormat === 'json' &&
                      typeof initialValue === 'object'))

                if (shouldLoad) {
                  if (
                    resolvedFormat === 'markdown' &&
                    typeof initialValue === 'string'
                  ) {
                    await importFromMarkdown(editor, initialValue)
                  } else if (
                    resolvedFormat === 'html' &&
                    typeof initialValue === 'string'
                  ) {
                    await importFromHtml(editor, initialValue)
                  } else if (
                    resolvedFormat === 'json' &&
                    typeof initialValue === 'object'
                  ) {
                    try {
                      const jsonString = JSON.stringify(initialValue)
                      const state = editor.parseEditorState(jsonString)
                      editor.setEditorState(state)
                    } catch (err) {
                      console.error(
                        '[BeatUI] Failed to parse JSON editor state:',
                        err
                      )
                      if (onError) {
                        onError(
                          err instanceof Error ? err : new Error(String(err)),
                          editor
                        )
                      }
                    }
                  }
                }
              }

              // React to external value changes
              if (value != null) {
                disposers.push(
                  Value.on(value as Signal<string | JsonContent>, async v => {
                    if (v == null) return
                    if (
                      resolvedFormat === 'markdown' &&
                      typeof v === 'string'
                    ) {
                      const current = await exportToMarkdown(editor)
                      if (v !== current) {
                        await importFromMarkdown(editor, v)
                      }
                    } else if (
                      resolvedFormat === 'html' &&
                      typeof v === 'string'
                    ) {
                      const current = await exportToHtml(editor)
                      if (v !== current) {
                        await importFromHtml(editor, v)
                      }
                    } else if (
                      resolvedFormat === 'json' &&
                      typeof v === 'object'
                    ) {
                      const currentJson = JSON.stringify(
                        editor.getEditorState().toJSON()
                      )
                      const newJson = JSON.stringify(v)
                      if (currentJson !== newJson) {
                        const state = editor.parseEditorState(newJson)
                        editor.setEditorState(state)
                      }
                    }
                  })
                )
              }

              // React to readOnly changes
              if (readOnly != null) {
                disposers.push(
                  Value.on(readOnly, ro => {
                    editor.setEditable(!ro)
                  })
                )
              }

              // Register blur handler
              disposers.push(
                editor.registerCommand(
                  BLUR_COMMAND,
                  () => {
                    if (onBlur) {
                      onBlur(editor)
                    }
                    if (onChange) {
                      editor.getEditorState().read(async () => {
                        if (resolvedFormat === 'markdown') {
                          const md = await exportToMarkdown(editor)
                          onChange(md as string & JsonContent, editor)
                        } else if (resolvedFormat === 'html') {
                          const htmlContent = await exportToHtml(editor)
                          onChange(htmlContent as string & JsonContent, editor)
                        } else if (resolvedFormat === 'json') {
                          onChange(
                            editor
                              .getEditorState()
                              .toJSON() as unknown as string & JsonContent,
                            editor
                          )
                        }
                      })
                    }
                    return false
                  },
                  COMMAND_PRIORITY_LOW
                )
              )

              // React to theme changes
              disposers.push(
                appearance.on(a => {
                  const root = editor.getRootElement()
                  if (root) {
                    root.dataset.theme = a
                  }
                })
              )

              // Handle autofocus
              if (autoFocus) {
                editor.focus()
              } else {
                // Prevent browser from auto-focusing the contenteditable element
                const root = editor.getRootElement()
                if (root && root === document.activeElement) {
                  root.blur()
                }
              }

              // Notify ready
              if (onReady) {
                onReady(editor)
              }
            } catch (err) {
              console.error(
                '[BeatUI] Failed to initialize Lexical editor:',
                err
              )
              const el = container as HTMLElement
              el.textContent = `Failed to load Lexical editor.`
            }
          }

          mount()

          return OnDispose(() => {
            try {
              disposers.forEach(dispose => dispose())
            } catch {
              /* ignore cleanup errors */
            }
            try {
              editorInstance?.setRootElement(null)
            } catch {
              /* ignore cleanup errors */
            }
            editorSignal.set(null)
          })
        })
      )
    )
  )
}
