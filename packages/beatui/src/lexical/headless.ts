import type {
  LexicalEditor,
  SerializedEditorState,
  Klass,
  LexicalNode,
} from 'lexical'
import type { HeadlessEditorOptions } from './types'
import { loadLexicalCore } from './lazy-loader'
import {
  buildElementStyleExportMap,
  buildStyleImportMap,
} from './plugins/element-style'
import { importFromMarkdown, exportToMarkdown } from './plugins/markdown-io'
import { importFromHtml, exportToHtml } from './plugins/html-io'

/**
 * Create a headless Lexical editor instance (no DOM mounting).
 * Useful for server-side rendering, testing, or programmatic content manipulation.
 *
 * @example
 * ```ts
 * const editor = await createHeadlessEditor({
 *   nodes: [MyCustomNode],
 *   plugins: [myPlugin],
 * })
 *
 * editor.update(() => {
 *   const root = $getRoot()
 *   root.clear()
 *   // ... manipulate content
 * })
 *
 * const json = editor.getEditorState().toJSON()
 * ```
 */
export async function createHeadlessEditor(
  options: HeadlessEditorOptions = {}
): Promise<LexicalEditor> {
  const { nodes = [], plugins = [], onError } = options

  const lexical = await loadLexicalCore()

  // Create editor without mounting to DOM
  const editor = lexical.createEditor({
    namespace: 'BeatUIHeadless',
    nodes: nodes as Klass<LexicalNode>[],
    onError: error => {
      if (onError) {
        onError(error, editor)
      } else {
        console.error('[BeatUI Headless]', error)
      }
    },
    editable: false, // Headless editors are typically not editable
    html: {
      export: buildElementStyleExportMap(),
      import: buildStyleImportMap(),
    },
  })

  // Register custom plugins if provided
  if (plugins.length > 0) {
    for (const plugin of plugins) {
      plugin.register(editor)
    }
  }

  return editor
}

/**
 * Convert markdown string to Lexical JSON using a headless editor.
 */
export async function markdownToLexicalJson(
  markdown: string
): Promise<SerializedEditorState> {
  const editor = await createHeadlessEditor()
  await importFromMarkdown(editor, markdown)
  const json = editor.getEditorState().toJSON()

  return json
}

/**
 * Convert Lexical JSON to markdown string using a headless editor.
 */
export async function lexicalJsonToMarkdown(
  json: SerializedEditorState
): Promise<string> {
  const editor = await createHeadlessEditor()
  const state = editor.parseEditorState(JSON.stringify(json))
  editor.setEditorState(state)

  const markdown = await exportToMarkdown(editor)

  return markdown
}

/**
 * Convert HTML string to Lexical JSON using a headless editor.
 */
export async function htmlToLexicalJson(
  html: string
): Promise<SerializedEditorState> {
  const editor = await createHeadlessEditor()
  await importFromHtml(editor, html)
  const json = editor.getEditorState().toJSON()

  return json
}

/**
 * Convert Lexical JSON to HTML string using a headless editor.
 */
export async function lexicalJsonToHtml(
  json: SerializedEditorState
): Promise<string> {
  const editor = await createHeadlessEditor()
  const state = editor.parseEditorState(JSON.stringify(json))
  editor.setEditorState(state)

  const html = await exportToHtml(editor)

  return html
}
