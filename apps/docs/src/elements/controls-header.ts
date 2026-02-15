import { attr, html, TNode } from '@tempots/dom'

export function ControlsHeader(...children: TNode[]) {
  return html.div(
    attr.class('bg-gray-200 dark:bg-gray-700 p-4 flex flex-row gap-2 flex-wrap items-end'),
    ...children
  )
}
