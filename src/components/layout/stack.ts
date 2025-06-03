import { attr, html, TNode } from '@tempots/dom'

export function Stack(...children: TNode[]) {
  return html.div(attr.class('bc-stack'), ...children)
}
