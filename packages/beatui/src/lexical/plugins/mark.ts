import {
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  $getSelection,
  $isRangeSelection,
  $getRoot,
  type LexicalEditor,
  type TextNode,
} from 'lexical'
import {
  $wrapSelectionInMarkNode,
  $unwrapMarkNode,
  $getMarkIDs,
  $isMarkNode,
} from '@lexical/mark'
import type { MarkMetadata, MarkPluginCallbacks } from '../types'

/**
 * Register mark/annotation support.
 * Allows highlighting and annotating text with custom metadata.
 */
export async function registerMarkPlugin(
  editor: LexicalEditor,
  callbacks?: MarkPluginCallbacks
): Promise<() => void> {
  const disposers: Array<() => void> = []

  // Register click handler for marks
  if (callbacks?.onMarkClick) {
    disposers.push(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const target = event.target as HTMLElement
          if (target.classList.contains('bc-lexical-mark')) {
            const markId = target.dataset.markId
            if (markId) {
              callbacks.onMarkClick!(markId, {
                id: markId,
                type: target.dataset.markType || 'annotation',
                data: {},
              })
              return true
            }
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }

  return () => disposers.forEach(d => d())
}

/**
 * Apply a mark to the current selection.
 */
export async function applyMark(
  editor: LexicalEditor,
  id: string,
  _metadata?: Partial<MarkMetadata>
): Promise<void> {
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      $wrapSelectionInMarkNode(selection, selection.isBackward(), id)
    }
  })
}

/**
 * Remove a mark by its ID.
 */
export async function removeMark(
  editor: LexicalEditor,
  id: string
): Promise<void> {
  editor.update(() => {
    const root = $getRoot()
    // Find all mark nodes with the given ID
     
    const markNodes = root.getAllTextNodes().filter((node: TextNode) => {
      const parent = node.getParent()
      if ($isMarkNode(parent)) {
        // $getMarkIDs takes a TextNode and offset
        return $getMarkIDs(node, 0)?.includes(id) ?? false
      }
      return false
    })

    for (const node of markNodes) {
      const parent = node.getParent()
      if ($isMarkNode(parent)) {
        $unwrapMarkNode(parent)
      }
    }
  })
}
