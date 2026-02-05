import { COMMAND_PRIORITY_LOW, type LexicalEditor } from 'lexical'
import {
  registerList,
  registerCheckList,
  insertList,
  removeList,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { mergeRegister } from '@lexical/utils'

/**
 * Register list support (ordered, unordered, check lists).
 * Wraps @lexical/list functionality including check list click handling.
 */
export async function registerListPlugin(
  editor: LexicalEditor
): Promise<() => void> {
  // @lexical/list v0.40+ exports registerList which handles
  // all list commands and tab/shift-tab indentation
  if (typeof registerList === 'function') {
    // registerCheckList adds click/pointer/keyboard handlers for toggling
    // check list items — without it, clicking on checkboxes does nothing
    if (typeof registerCheckList === 'function') {
      return mergeRegister(registerList(editor), registerCheckList(editor))
    }
    return registerList(editor)
  }

  // Fallback: manually register list commands
  return mergeRegister(
    editor.registerCommand(
      INSERT_ORDERED_LIST_COMMAND,
      () => {
        insertList(editor, 'number')
        return true
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand(
      INSERT_UNORDERED_LIST_COMMAND,
      () => {
        insertList(editor, 'bullet')
        return true
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand(
      INSERT_CHECK_LIST_COMMAND,
      () => {
        insertList(editor, 'check')
        return true
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand(
      REMOVE_LIST_COMMAND,
      () => {
        removeList(editor)
        return true
      },
      COMMAND_PRIORITY_LOW
    )
  )
}
