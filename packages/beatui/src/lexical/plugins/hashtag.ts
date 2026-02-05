import type { LexicalEditor } from 'lexical'
import { CLICK_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical'
import { registerLexicalTextEntity } from '@lexical/text'
import { HashtagNode } from '@lexical/hashtag'
import type { HashtagPluginOptions } from '../types'

const HASHTAG_REGEX = /#[\w\u0590-\u05ff]+/

function $createHashtagNode(text: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (HashtagNode as any)(text)
}

/**
 * Register hashtag support.
 * Wraps @lexical/hashtag functionality.
 */
export async function registerHashtagPlugin(
  editor: LexicalEditor,
  options?: HashtagPluginOptions
): Promise<() => void> {
  const cleanups: Array<() => void> = []

  // Register text entity for hashtag detection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entityCleanup = (registerLexicalTextEntity as any)(
    editor,
    (text: string) => {
      const match = HASHTAG_REGEX.exec(text)
      return match
        ? { start: match.index, end: match.index + match[0].length }
        : null
    },
    HashtagNode,
    $createHashtagNode
  )

  // Handle both array and single function returns
  if (Array.isArray(entityCleanup)) {
    cleanups.push(...entityCleanup)
  } else if (typeof entityCleanup === 'function') {
    cleanups.push(entityCleanup)
  }

  // Register click handler if callback provided
  if (options?.onHashtagClick) {
    const removeClickListener = editor.registerCommand(
      CLICK_COMMAND,
      (event: MouseEvent) => {
        const target = event.target as HTMLElement
        if (target.classList.contains('bc-lexical-hashtag')) {
          const text = target.textContent
          if (text) {
            options.onHashtagClick!(text.replace('#', ''))
            return true
          }
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    )
    cleanups.push(removeClickListener)
  }

  return () => {
    cleanups.forEach(cleanup => cleanup())
  }
}
