import { attr, html, TNode } from '@tempots/dom'

export function ControlsHeader(...children: TNode[]) {
  return html.div(
    attr.class(
      'bu-bg--lighter-neutral bu-p-4 bu-flex-row bu-gap-4 bu-flex-wrap bu-items-center'
    ),
    ...children
  )
}
