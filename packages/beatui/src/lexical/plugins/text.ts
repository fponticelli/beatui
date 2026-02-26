import type { LexicalEditor } from 'lexical'
import { $getRoot, $getSelection, $isRangeSelection } from 'lexical'

/**
 * Get the text content of the editor (plain text, no formatting).
 */
export function getTextContent(editor: LexicalEditor): string {
  let text = ''
  editor.getEditorState().read(() => {
    text = $getRoot().getTextContent()
  })
  return text
}

/**
 * Get the character count of the editor content.
 */
export function getCharacterCount(editor: LexicalEditor): number {
  return getTextContent(editor).length
}

/**
 * Get the word count of the editor content.
 */
export function getWordCount(editor: LexicalEditor): number {
  const text = getTextContent(editor).trim()
  if (!text) return 0
  return text.split(/\s+/).length
}

/**
 * Insert text at the current cursor position, replacing any selected text.
 * Designed for use as a snippet `onSelect` callback helper.
 */
export function insertTextAtCursor(editor: LexicalEditor, text: string): void {
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      selection.insertText(text)
    }
  })
  editor.focus()
}
