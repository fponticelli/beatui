import { $getRoot, type LexicalEditor } from 'lexical'
import type { OverflowPluginOptions } from '../types'

/**
 * Register overflow/character limit detection.
 * Monitors content length and triggers callbacks when limits are exceeded.
 */
export async function registerOverflowPlugin(
  editor: LexicalEditor,
  options: OverflowPluginOptions
): Promise<() => void> {
  const { maxLength, onOverflow } = options

  return editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      const root = $getRoot()
      const text = root.getTextContent()
      const currentLength = text.length
      const isOverflowing = currentLength > maxLength

      if (onOverflow) {
        onOverflow(isOverflowing, currentLength)
      }
    })
  })
}
