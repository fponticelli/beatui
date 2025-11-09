import { Icon } from '../../data'
import {
  aria,
  attr,
  DOMContext,
  html,
  on,
  TNode,
  Use,
  Value,
  When,
} from '@tempots/dom'
import { Anchor, Location } from '@tempots/ui'
import type { LocationHandle, NavigationOptions } from '@tempots/ui'
import { buildNavigationOptions } from '../link/navigation-options'
import { createLocationMatcher } from '../link/navigation-link'

export type UrlAction = {
  href: Value<string>
  viewTransition?: boolean
  state?: NavigationOptions['state']
  scroll?: NavigationOptions['scroll']
  replace?: NavigationOptions['replace']
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
  // ARIA attributes for accessibility
  ariaExpanded?: Value<boolean>
  ariaControls?: Value<string>
  ariaLabel?: Value<string>
} & LinkAction

export function SidebarUrlLink(options: UrlAction, ...children: TNode[]) {
  const navigationOptions = buildNavigationOptions({
    viewTransition: options.viewTransition ?? true,
    state: options.state,
    scroll: options.scroll,
    replace: options.replace,
  })
  return Anchor({ href: options.href, ...navigationOptions }, ...children)
}

export function SidebarActiveLink(...children: TNode[]) {
  return html.span(...children)
}

export function SidebarClickLink(
  options: ClickAction &
    Partial<
      Pick<SidebarLinkOptions, 'ariaExpanded' | 'ariaControls' | 'ariaLabel'>
    >,
  ...children: TNode[]
) {
  return html.button(
    attr.type('button'),
    on.click(options.onClick),
    options.ariaExpanded != null
      ? aria.expanded(
          Value.map(
            options.ariaExpanded,
            expanded => expanded as boolean | 'undefined'
          )
        )
      : null,
    options.ariaControls != null ? aria.controls(options.ariaControls) : null,
    options.ariaLabel != null ? aria.label(options.ariaLabel) : null,
    ...children
  )
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
        attr.type('button'),
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
  return Use(Location, (locationHandle: LocationHandle) => {
    const isActive = locationHandle.matchSignal(
      createLocationMatcher(options.href, 'exact'),
      {
        includeSearch: false,
        includeHash: false,
      }
    )

    return When(
      isActive,
      () => SidebarActiveLink(...children),
      () => SidebarUrlLink(options, ...children)
    )
  })
}
