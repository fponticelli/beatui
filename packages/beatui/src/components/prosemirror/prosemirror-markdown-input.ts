import {
  Renderable,
  Value,
  WithElement,
  OnDispose,
  html,
  attr,
  Use,
  computedOf,
  prop,
  When,
  Task,
  Fragment,
} from '@tempots/dom'
import type { InputOptions } from '../form/input/input-options'
import { Merge } from '@tempots/std'
import { Theme } from '../theme'
import { ProseMirrorToolbar } from './prosemirror-toolbar'
import { LinkPortal } from '../misc/link-portal'
import { EditorState, Plugin } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { MarkSpec, NodeSpec, Schema } from 'prosemirror-model'
import { schema as basicSchema } from 'prosemirror-schema-basic'
import {
  defaultMarkdownParser,
  defaultMarkdownSerializer,
} from 'prosemirror-markdown'
import { history, undo, redo } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap, toggleMark } from 'prosemirror-commands'
import { ticker } from '@tempots/ui'

/**
 * Markdown features that can be enabled/disabled in the editor
 */
export interface MarkdownFeatures {
  /** Enable heading nodes (h1-h6) */
  headings: boolean
  /** Enable bold text */
  bold: boolean
  /** Enable italic text */
  italic: boolean
  /** Enable code inline */
  code: boolean
  /** Enable links */
  links: boolean
  /** Enable bullet lists */
  bulletList: boolean
  /** Enable ordered lists */
  orderedList: boolean
  /** Enable blockquotes */
  blockquote: boolean
  /** Enable code blocks */
  codeBlock: boolean
  /** Enable horizontal rules */
  horizontalRule: boolean
  /** Enable hard breaks */
  hardBreak: boolean
  /** Maximum heading level */
  headerLevels: number
}

/**
 * Options for the ProseMirror Markdown editor
 */
export type ProseMirrorMarkdownInputOptions = Merge<
  InputOptions<string>,
  {
    /** Show toolbar with formatting buttons */
    showToolbar?: Value<boolean>
    /** Configure which markdown features are enabled */
    features?: Value<MarkdownFeatures>
    /** CSS injection strategy */
    cssInjection?: 'link' | 'none'
    /** Read-only mode */
    readOnly?: Value<boolean>
  }
>

/**
 * Default markdown features - all enabled
 */
export const DEFAULT_FEATURES: MarkdownFeatures = {
  headings: true,
  bold: true,
  italic: true,
  code: true,
  links: true,
  bulletList: true,
  orderedList: true,
  blockquote: true,
  codeBlock: true,
  horizontalRule: true,
  hardBreak: true,
  headerLevels: 3,
}

function stateWatcher(onChange: () => void) {
  return new Plugin({
    view: () => ({
      update: () => {
        onChange()
      },
    }),
    filterTransaction: () => {
      onChange()
      return true
    },
  })
}

/**
 * ProseMirrorMarkdownInput - A markdown editor built on ProseMirror
 *
 * Features:
 * - Base markdown support (configurable)
 * - Optional toolbar for formatting
 * - Reactive value binding
 * - Theme-aware (light/dark mode)
 * - Accessible keyboard shortcuts
 *
 * @example
 * ```ts
 * const markdown = prop('# Hello World')
 *
 * ProseMirrorMarkdownInput({
 *   value: markdown,
 *   onInput: v => markdown.set(v),  // Called on every document change
 *   onChange: v => console.log('Saved:', v),  // Called when editor loses focus
 *   showToolbar: true,
 *   features: {
 *     headings: true,
 *     bold: true,
 *     italic: true,
 *   }
 * })
 * ```
 */
export const ProseMirrorMarkdownInput = (
  options: ProseMirrorMarkdownInputOptions
): Renderable => {
  const {
    value,
    onChange,
    onInput,
    onBlur,
    class: cls,
    id,
    name,
    hasError,
    disabled,
    autofocus = false,
    readOnly = false,
    placeholder,
    showToolbar = false,
    features,
  } = options

  const resolvedReadonly = Value.toSignal(readOnly)
  const resolvedDisabled = Value.toSignal(disabled ?? false)
  const resolvedShowToolbar = Value.toSignal(showToolbar)
  const resolvedFeatures = computedOf(features ?? DEFAULT_FEATURES)(f => ({
    ...DEFAULT_FEATURES,
    ...f,
  }))

  // Store editor view for toolbar
  const editorView = prop<EditorView | null>(null)
  const editorStateNotifier = ticker()

  return Fragment(
    Use(Theme, ({ appearance }) =>
      html.div(
        OnDispose(() => {
          editorView.value?.destroy()
        }),
        (options.cssInjection ?? 'none') === 'none'
          ? null
          : Task(
              () => import('../../prosemirror/styles-url'),
              ({ default: href }) =>
                LinkPortal({ id: 'beatui-prosemirror-css', href })
            ),
        attr.class('bc-prosemirror-editor-container'),
        attr.class(cls),
        attr.class(
          Value.map(hasError ?? false, (e): string =>
            e ? 'bc-input-container--error' : ''
          )
        ),
        attr.id(id),
        attr.name(name),
        // Optional toolbar
        When(
          resolvedShowToolbar,
          () =>
            When(
              editorView.map(v => v != null),
              () =>
                ProseMirrorToolbar({
                  view: editorView,
                  stateUpdate: editorStateNotifier,
                  features: resolvedFeatures,
                  readOnly: resolvedReadonly,
                })
            ),
          () => null
        ),
        // Editor mount point
        html.div(
          attr.class('bc-prosemirror-editor'),
          WithElement(container => {
            // ProseMirror editor will be initialized here
            const disposers: Array<() => void> = []

            const mount = () => {
              try {
                // Get initial values
                const initialValue = Value.get(value) ?? ''
                const initialReadonly = Value.get(resolvedReadonly) ?? false
                const initialDisabled = Value.get(resolvedDisabled) ?? false
                const currentFeatures = Value.get(resolvedFeatures)

                // Create filtered schema based on enabled features
                const filteredSchema = createFilteredSchema(
                  Schema,
                  basicSchema,
                  currentFeatures
                )

                // Parse initial markdown
                const doc =
                  defaultMarkdownParser.parse(initialValue) ?? undefined

                // Create keyboard shortcuts for formatting
                const formatKeymap = createFormatKeymap(filteredSchema)

                // Create editor state
                const state = EditorState.create({
                  doc,
                  schema: filteredSchema,
                  plugins: [
                    history(),
                    keymap({
                      'Mod-z': undo,
                      'Mod-y': redo,
                      'Mod-Shift-z': redo,
                    }),
                    keymap(formatKeymap),
                    keymap(baseKeymap),
                    stateWatcher(editorStateNotifier.tick),
                  ],
                })

                // Create editor view
                const view = new EditorView(container as HTMLElement, {
                  state,
                  editable: () => !initialReadonly && !initialDisabled,
                  dispatchTransaction(transaction) {
                    const newState = view.state.apply(transaction)
                    view.updateState(newState)

                    // Emit onInput when document changes
                    if (transaction.docChanged && onInput != null) {
                      const markdown = defaultMarkdownSerializer.serialize(
                        newState.doc
                      )
                      onInput(markdown)
                    }
                  },
                })

                // Store view for toolbar
                editorView.set(view)

                // Handle autofocus
                if (Value.get(autofocus)) {
                  view.focus()
                }

                // Handle placeholder
                // Note: ProseMirror doesn't have built-in placeholder support
                // We'll add it via CSS and data attributes
                if (placeholder != null) {
                  disposers.push(
                    Value.on(placeholder, p => {
                      if (p != null && p !== '') {
                        container.setAttribute('data-placeholder', p)
                      } else {
                        container.removeAttribute('data-placeholder')
                      }
                    })
                  )
                }

                // React to readonly changes
                disposers.push(
                  Value.on(resolvedReadonly, ro => {
                    const disabled = Value.get(resolvedDisabled)
                    view.setProps({ editable: () => !ro && !disabled })
                  })
                )

                // React to disabled changes
                disposers.push(
                  Value.on(resolvedDisabled, dis => {
                    const readonly = Value.get(resolvedReadonly)
                    view.setProps({ editable: () => !readonly && !dis })
                  })
                )

                // React to external value changes
                disposers.push(
                  Value.on(value, v => {
                    const currentMarkdown = defaultMarkdownSerializer.serialize(
                      view.state.doc
                    )
                    if (v !== currentMarkdown) {
                      const newDoc = defaultMarkdownParser.parse(v ?? '')
                      if (newDoc != null) {
                        const newState = EditorState.create({
                          doc: newDoc,
                          schema: filteredSchema,
                          plugins: view.state.plugins,
                        })
                        view.updateState(newState)
                      }
                    }
                  })
                )

                // Handle blur events - emit onChange when editor loses focus
                if (onChange != null) {
                  const handleBlur = () => {
                    const markdown = defaultMarkdownSerializer.serialize(
                      view.state.doc
                    )
                    onChange(markdown)
                  }
                  container.addEventListener('blur', handleBlur, true)
                  disposers.push(() =>
                    container.removeEventListener('blur', handleBlur, true)
                  )
                }

                // Handle legacy onBlur callback
                if (onBlur != null) {
                  const handleBlur = () => {
                    onBlur()
                  }
                  container.addEventListener('blur', handleBlur, true)
                  disposers.push(() =>
                    container.removeEventListener('blur', handleBlur, true)
                  )
                }

                // Apply theme
                disposers.push(
                  appearance.on(a => {
                    if (a === 'dark') {
                      container.classList.add('bc-prosemirror-editor--dark')
                    } else {
                      container.classList.remove('bc-prosemirror-editor--dark')
                    }
                  })
                )

                // Cleanup
                disposers.push(() => view.destroy())
              } catch (err) {
                console.error(
                  '[BeatUI] Failed to initialize ProseMirror editor:',
                  err
                )
                const el = container as HTMLElement
                el.textContent =
                  'Failed to load ProseMirror Editor. Please ensure prosemirror packages are installed.'
              }
            }

            mount()

            return OnDispose(() => {
              disposers.forEach(dispose => dispose())
            })
          })
        )
      )
    )
  )
}

/**
 * Create keyboard shortcuts for text formatting
 */
function createFormatKeymap(schema: Schema<string, string>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keymap: Record<string, (state: any, dispatch: any) => boolean> = {}

  // Bold (Ctrl+B / Cmd+B)
  const strongMark = schema.marks.strong
  if (strongMark != null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keymap['Mod-b'] = (state: any, dispatch: any) => {
      return toggleMark(strongMark)(state, dispatch)
    }
  }

  // Italic (Ctrl+I / Cmd+I)
  const emMark = schema.marks.em
  if (emMark != null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keymap['Mod-i'] = (state: any, dispatch: any) => {
      return toggleMark(emMark)(state, dispatch)
    }
  }

  // Code (Ctrl+` / Cmd+`)
  const codeMark = schema.marks.code
  if (codeMark != null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keymap['Mod-`'] = (state: any, dispatch: any) => {
      return toggleMark(codeMark)(state, dispatch)
    }
  }

  return keymap
}

/**
 * Create a filtered schema based on enabled features
 */
function createFilteredSchema(
  MakeSchema: typeof Schema<string, string>,
  basicSchema: Schema<string, string>,
  features: MarkdownFeatures
) {
  const nodes: Record<string, NodeSpec> = {}
  const marks: Record<string, MarkSpec> = {}

  // Always include doc and text
  const docSpec = basicSchema.spec.nodes.get('doc')
  const textSpec = basicSchema.spec.nodes.get('text')

  if (docSpec == null || textSpec == null) {
    throw new Error('Basic schema missing required doc or text nodes')
  }

  nodes.doc = { ...docSpec, content: 'block+' }
  nodes.text = textSpec

  // Always include paragraph
  const paragraphSpec = basicSchema.spec.nodes.get('paragraph')
  if (paragraphSpec != null) {
    nodes.paragraph = { ...paragraphSpec, content: 'inline*' }
  }

  // Add nodes based on features
  if (features.headings) {
    const headingSpec = basicSchema.spec.nodes.get('heading')
    if (headingSpec != null) {
      nodes.heading = { ...headingSpec, content: 'inline*' }
    }
  }

  if (features.bulletList) {
    const bulletListSpec = basicSchema.spec.nodes.get('bullet_list')
    const listItemSpec = basicSchema.spec.nodes.get('list_item')
    if (bulletListSpec != null) {
      nodes.bullet_list = { ...bulletListSpec, content: 'list_item+' }
    }
    if (listItemSpec != null) {
      nodes.list_item = { ...listItemSpec, content: 'paragraph block*' }
    }
  }

  if (features.orderedList) {
    const orderedListSpec = basicSchema.spec.nodes.get('ordered_list')
    const listItemSpec = basicSchema.spec.nodes.get('list_item')
    if (orderedListSpec != null) {
      nodes.ordered_list = { ...orderedListSpec, content: 'list_item+' }
    }
    if (listItemSpec != null && !nodes.list_item) {
      nodes.list_item = { ...listItemSpec, content: 'paragraph block*' }
    }
  }

  if (features.blockquote) {
    const blockquoteSpec = basicSchema.spec.nodes.get('blockquote')
    if (blockquoteSpec != null) {
      nodes.blockquote = { ...blockquoteSpec, content: 'block+' }
    }
  }

  if (features.codeBlock) {
    const codeBlockSpec = basicSchema.spec.nodes.get('code_block')
    if (codeBlockSpec != null) {
      nodes.code_block = codeBlockSpec
    }
  }

  if (features.horizontalRule) {
    const hrSpec = basicSchema.spec.nodes.get('horizontal_rule')
    if (hrSpec != null) {
      nodes.horizontal_rule = hrSpec
    }
  }

  if (features.hardBreak) {
    const hardBreakSpec = basicSchema.spec.nodes.get('hard_break')
    if (hardBreakSpec != null) {
      nodes.hard_break = hardBreakSpec
    }
  }

  // Add marks based on features
  if (features.bold) {
    const strongSpec = basicSchema.spec.marks.get('strong')
    if (strongSpec != null) {
      marks.strong = strongSpec
    }
  }

  if (features.italic) {
    const emSpec = basicSchema.spec.marks.get('em')
    if (emSpec != null) {
      marks.em = emSpec
    }
  }

  if (features.code) {
    const codeSpec = basicSchema.spec.marks.get('code')
    if (codeSpec != null) {
      marks.code = codeSpec
    }
  }

  if (features.links) {
    const linkSpec = basicSchema.spec.marks.get('link')
    if (linkSpec != null) {
      marks.link = linkSpec
    }
  }

  return new MakeSchema({ nodes, marks })
}
