import { $getRoot, $insertNodes, type LexicalEditor } from 'lexical'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'

/**
 * Export the editor content to HTML string.
 */
export async function exportToHtml(editor: LexicalEditor): Promise<string> {
  let html = ''
  editor.getEditorState().read(() => {
    html = $generateHtmlFromNodes(editor)
  })
  return html
}

/**
 * Import HTML content into the editor, replacing current content.
 */
export async function importFromHtml(
  editor: LexicalEditor,
  html: string
): Promise<void> {
  editor.update(() => {
    const parser = new DOMParser()
    const dom = parser.parseFromString(html, 'text/html')
    const nodes = $generateNodesFromDOM(editor, dom)
    const root = $getRoot()
    root.clear()
    $insertNodes(nodes)
  })
}
