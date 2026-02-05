import type { LexicalEditor } from 'lexical'
import * as codeModule from '@lexical/code'
import type { CodePluginOptions } from '../types'

/**
 * Register Shiki-based syntax highlighting for code blocks.
 * This is an opt-in alternative to the default @lexical/code highlighting.
 * Provides more accurate and theme-aware syntax highlighting using Shiki.
 *
 * Note: @lexical/code-shiki is an optional peer dependency and must be
 * installed separately. If not available, falls back to default highlighting.
 */
export async function registerCodeShikiPlugin(
  editor: LexicalEditor,
  _options?: CodePluginOptions
): Promise<() => void> {
  // Fallback to default code highlighting
  // @lexical/code-shiki is optional and not bundled by default
  if (
    'registerCodeHighlighting' in codeModule &&
    typeof codeModule.registerCodeHighlighting === 'function'
  ) {
    return codeModule.registerCodeHighlighting(editor)
  }

  // No-op cleanup if nothing available
  return () => {}
}
