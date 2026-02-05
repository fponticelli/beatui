import type { LexicalEditor } from 'lexical'
import * as tableModule from '@lexical/table'
import type { TablePluginOptions } from '../types'

/**
 * Register table support.
 * Wraps @lexical/table functionality.
 */
export async function registerTablePlugin(
  editor: LexicalEditor,
  _options?: TablePluginOptions
): Promise<() => void> {
  // Check if registerTablePlugin is exported from @lexical/table
  if (
    'registerTablePlugin' in tableModule &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (tableModule as any).registerTablePlugin === 'function'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (tableModule as any).registerTablePlugin(editor)
  }

  // Fallback: no-op if not available
  return () => {}
}

/**
 * Insert a new table at the current selection.
 */
export async function insertTable(
  editor: LexicalEditor,
  rows: number = 3,
  columns: number = 3
): Promise<void> {
  editor.dispatchCommand(tableModule.INSERT_TABLE_COMMAND, {
    rows: String(rows),
    columns: String(columns),
    includeHeaders: true,
  })
}
