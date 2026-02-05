import type { LexicalEditor } from 'lexical'
import { createEmptyHistoryState, registerHistory } from '@lexical/history'
import type { HistoryPluginOptions } from '../types'

/**
 * Register undo/redo history support.
 * Wraps @lexical/history's registerHistory.
 */
export async function registerHistoryPlugin(
  editor: LexicalEditor,
  options?: HistoryPluginOptions
): Promise<() => void> {
  const historyState = createEmptyHistoryState()
  const delay = options?.delay ?? 300
  return registerHistory(editor, historyState, delay)
}
