/**
 * Lexical commands re-exports and custom BeatUI commands.
 *
 * Re-exports commonly used Lexical commands so consumers don't need
 * to import from 'lexical' directly for basic operations.
 */

// Re-export core Lexical commands
export {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
  PASTE_COMMAND,
  COPY_COMMAND,
  CUT_COMMAND,
  CLEAR_EDITOR_COMMAND,
  CLICK_COMMAND,
  FOCUS_COMMAND,
  BLUR_COMMAND,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_NORMAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from 'lexical'

// Re-export list commands
export {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'

// Custom BeatUI commands
import { createCommand } from 'lexical'

/** Command to toggle the slash command palette */
export const TOGGLE_SLASH_COMMAND_PALETTE = createCommand<void>(
  'TOGGLE_SLASH_COMMAND_PALETTE'
)

/** Command to insert a horizontal rule */
export const INSERT_HORIZONTAL_RULE_COMMAND = createCommand<void>(
  'INSERT_HORIZONTAL_RULE_COMMAND'
)

/** Command to insert an image (future use) */
export const INSERT_IMAGE_COMMAND = createCommand<{
  src: string
  alt?: string
}>('INSERT_IMAGE_COMMAND')
