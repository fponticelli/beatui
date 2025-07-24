import { Stack } from '@/components/layout'
import { attr, html, TNode, Value } from '@tempots/dom'

export type SidebarGroupOptions = {
  rail?: Value<boolean>
  header?: TNode
}

export function SidebarGroup(
  { rail, header }: SidebarGroupOptions,
  ...children: TNode[]
) {
  return Stack(
    header != null
      ? html.div(attr.class('bc-sidebar-group__header'), header)
      : null,
    html.div(
      attr.class(
        Value.map(rail ?? false, (v): string =>
          v ? 'bc-sidebar-group--rail' : ''
        )
      ),
      attr.class('bc-sidebar-group'),
      ...children
    )
  )
}
