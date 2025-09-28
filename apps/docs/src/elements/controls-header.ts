import { attr, html, TNode } from '@tempots/dom'

export function ControlsHeader(...children: TNode[]) {
  return html.div(
    attr.class('flex bg-neutral-100 p-4 flex-row gap-2 flex-wrap items-end'),
    ...children
  )
}
