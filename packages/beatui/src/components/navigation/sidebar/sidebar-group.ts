import { attr, html, TNode, Value } from '@tempots/dom'

export type SidebarGroupOptions = {
  rail?: Value<boolean>
}

export function SidebarGroup(
  { rail }: SidebarGroupOptions,
  ...children: TNode[]
) {
  return html.div(
    attr.class(
      Value.map(rail ?? false, (v): string =>
        v ? 'bc-sidebar-group--rail' : ''
      )
    ),
    attr.class('bc-sidebar-group'),
    ...children
  )
}
