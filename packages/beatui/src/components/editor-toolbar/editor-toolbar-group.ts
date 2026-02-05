import { computedOf, Signal, TNode, When } from '@tempots/dom'
import { ToolbarGroup } from '../navigation'

/**
 * A reusable toolbar group component for rich text editors.
 * Shows the group only when at least one of the display signals is true.
 * Used by both Lexical and ProseMirror editor toolbars.
 */
export function EditorToolbarGroup(
  {
    display,
  }: {
    display: Signal<boolean>[]
  },
  ...children: TNode[]
) {
  return When(
    computedOf(...display)((...v) => v.some(Boolean)),
    () => ToolbarGroup(...children)
  )
}
