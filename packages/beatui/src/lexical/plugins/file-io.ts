import type { LexicalEditor } from 'lexical'
import type { ContentFormatType } from '../types'
import { exportToMarkdown } from './markdown-io'
import { exportToHtml } from './html-io'

/**
 * Export editor content to a downloadable file.
 */
export async function exportEditorToFile(
  editor: LexicalEditor,
  format: ContentFormatType,
  filename?: string
): Promise<void> {
  let content: string
  let mimeType: string
  let ext: string

  switch (format) {
    case 'markdown':
      content = await exportToMarkdown(editor)
      mimeType = 'text/markdown'
      ext = 'md'
      break
    case 'html':
      content = await exportToHtml(editor)
      mimeType = 'text/html'
      ext = 'html'
      break
    case 'json':
      content = JSON.stringify(editor.getEditorState().toJSON(), null, 2)
      mimeType = 'application/json'
      ext = 'json'
      break
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? `document.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Import content from a file into the editor.
 */
export async function importFileToEditor(
  editor: LexicalEditor,
  file: File,
  format?: ContentFormatType
): Promise<void> {
  const text = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
  const detectedFormat = format ?? detectFormat(file.name)

  switch (detectedFormat) {
    case 'markdown': {
      const { importFromMarkdown } = await import('./markdown-io')
      await importFromMarkdown(editor, text)
      break
    }
    case 'html': {
      const { importFromHtml } = await import('./html-io')
      await importFromHtml(editor, text)
      break
    }
    case 'json': {
      const state = editor.parseEditorState(text)
      editor.setEditorState(state)
      break
    }
  }
}

function detectFormat(filename: string): ContentFormatType {
  if (filename.endsWith('.md') || filename.endsWith('.markdown'))
    return 'markdown'
  if (filename.endsWith('.html') || filename.endsWith('.htm')) return 'html'
  return 'json'
}
