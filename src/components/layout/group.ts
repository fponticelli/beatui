import { attr, html, TNode } from '@tempots/dom'
// import { AlignItems, JustifyContent } from '../theme'

export type GroupOptions = {}

export function Group({}: GroupOptions, ...children: TNode[]) {
  return html.div(attr.class('bc-group'), ...children)
}
