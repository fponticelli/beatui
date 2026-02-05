import type { LexicalEditor } from 'lexical'
import { registerRichText } from '@lexical/rich-text'

/**
 * Register rich text editing support.
 * Wraps @lexical/rich-text's registerRichText.
 */
export async function registerRichTextPlugin(
  editor: LexicalEditor
): Promise<() => void> {
  return registerRichText(editor)
}
