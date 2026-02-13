import { attr, html, TNode } from '@tempots/dom'

export function ControlsHeader(...children: TNode[]) {
  return html.div(attr.class('sc-controls-header'), ...children)
}
