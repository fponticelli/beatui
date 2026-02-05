import type { LexicalEditor } from 'lexical'
import { registerPlainText } from '@lexical/plain-text'

/**
 * Register plain text editing support.
 * Wraps @lexical/plain-text's registerPlainText.
 */
export async function registerPlainTextPlugin(
  editor: LexicalEditor
): Promise<() => void> {
  return registerPlainText(editor)
}
