import { computedOf, Signal, TNode, When } from '@tempots/dom'
import { ToolbarGroup } from '../../navigation'

export function LexicalToolbarGroup(
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
