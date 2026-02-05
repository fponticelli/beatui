import type { LexicalEditor } from 'lexical'
import * as codeModule from '@lexical/code'
import type { CodePluginOptions } from '../types'

/**
 * Register code block support with syntax highlighting.
 * Wraps @lexical/code functionality.
 */
export async function registerCodePlugin(
  editor: LexicalEditor,
  _options?: CodePluginOptions
): Promise<() => void> {
  // Check if registerCodeHighlighting exists
  if (
    'registerCodeHighlighting' in codeModule &&
    typeof codeModule.registerCodeHighlighting === 'function'
  ) {
    return codeModule.registerCodeHighlighting(editor)
  }

  // Fallback: return a no-op cleanup function
  return () => {}
}
