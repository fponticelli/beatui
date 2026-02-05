import { COMMAND_PRIORITY_LOW, type LexicalEditor } from 'lexical'
import { toggleLink, TOGGLE_LINK_COMMAND } from '@lexical/link'

/**
 * Register link support.
 * Wraps @lexical/link functionality.
 */
export async function registerLinkPlugin(
  editor: LexicalEditor
): Promise<() => void> {
  return editor.registerCommand(
    TOGGLE_LINK_COMMAND,
    payload => {
      if (payload === null) {
        toggleLink(payload)
      } else if (typeof payload === 'string') {
        toggleLink(payload)
      } else {
        toggleLink(payload.url, payload)
      }
      return true
    },
    COMMAND_PRIORITY_LOW
  )
}
