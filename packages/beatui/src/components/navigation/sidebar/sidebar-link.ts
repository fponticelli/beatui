import { Icon } from '@/components/data'
import {
  attr,
  computedOf,
  DOMContext,
  html,
  on,
  TNode,
  Use,
  Value,
  When,
} from '@tempots/dom'
import { Location } from '@tempots/ui'

export type UrlAction = {
  href: Value<string>
}

export type ClickAction = {
  onClick: () => void
}

export type LinkAction = UrlAction | ClickAction

export type SidebarLinkOptions = {
  content: TNode
  icon?: Value<string>
  right?: TNode
  action?: {
    icon: Value<string>
    label?: Value<string>
    onClick?: (ctx: DOMContext) => void
  }
} & LinkAction

function SidebarUrlLink(options: UrlAction, ...children: TNode[]) {
  return html.a(attr.href(options.href), ...children)
}

function SidebarActiveLink(...children: TNode[]) {
  return html.span(...children)
}

function SidebarClickLink(options: ClickAction, ...children: TNode[]) {
  return html.button(on.click(options.onClick), ...children)
}

export function SidebarLink(options: SidebarLinkOptions) {
  const children = [attr.class('bc-sidebar-link')] as TNode[]
  if (options.icon != null) {
    children.push(
      html.span(
        attr.class('bc-sidebar-link--icon'),
        Icon({ icon: options.icon })
      )
    )
  }
  children.push(
    html.span(attr.class('bc-sidebar-link__content'), options.content)
  )
  if (options.right != null) {
    children.push(
      html.span(attr.class('bc-sidebar-link__right'), options.right)
    )
  }
  if (options.action != null) {
    children.push(
      html.button(
        attr.class('bc-sidebar-link--action'),
        on.click((_, ctx) => {
          options.action?.onClick?.(ctx)
        }),
        Icon({ icon: options.action?.icon })
      )
    )
  }
  if ('onClick' in options) {
    return SidebarClickLink(options, ...children)
  }
  return Use(Location, location => {
    const isActive = computedOf(
      location,
      options.href
    )(({ pathname }, href) => pathname === href)
    return When(
      isActive,
      () => SidebarActiveLink(...children),
      () => SidebarUrlLink(options, ...children)
    )
  })
}
