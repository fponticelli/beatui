import { attr, html, TNode } from '@tempots/dom'
// import { AlignItems, JustifyContent } from '../theme'

export type StackOptions = {
  // gap?: Value<number>
  // horizontal?: Value<JustifyContent>
  // vertical?: Value<AlignItems>
}

export function Stack({}: StackOptions, ...children: TNode[]) {
  return html.div(attr.class('flex flex-col'), ...children)
}
