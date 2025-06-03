import { attr, html, TNode } from '@tempots/dom'

export function Group(...children: TNode[]) {
  return html.div(attr.class('bc-group'), ...children)
}
