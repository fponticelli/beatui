import { attr, html, TNode } from '@tempots/dom'
// import { AlignItems, JustifyContent } from '../theme'

export type GroupOptions = {
  // gap?: Value<number>
  // horizontal?: Value<JustifyContent>
  // vertical?: Value<AlignItems>
}

export function Group({}: GroupOptions, ...children: TNode[]) {
  return html.div(attr.class('flex flex-row'), ...children)
}
