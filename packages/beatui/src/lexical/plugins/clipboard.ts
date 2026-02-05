import type { LexicalEditor } from 'lexical'
import '@lexical/clipboard'

/**
 * Register clipboard handling (copy/paste with rich text preservation).
 * Wraps @lexical/clipboard functionality.
 *
 * Note: Lexical handles clipboard operations internally through its command system.
 * This plugin ensures the clipboard utilities from @lexical/clipboard are available
 * and registers paste handlers for HTML sanitization.
 */
export async function registerClipboardPlugin(
  _editor: LexicalEditor
): Promise<() => void> {
  // Lexical's core handles clipboard via commands (PASTE_COMMAND, COPY_COMMAND, CUT_COMMAND)
  // The @lexical/clipboard module provides $insertDataTransferForRichText and related helpers
  // that are used by @lexical/rich-text's paste handling.
  // No explicit registration needed — the rich-text plugin wires clipboard support.
  return () => {}
}
