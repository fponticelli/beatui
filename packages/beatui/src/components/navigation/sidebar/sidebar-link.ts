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
  WithElement,
} from '@tempots/dom'
import { Anchor, Location } from '@tempots/ui'

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
  // ARIA attributes for accessibility
  ariaExpanded?: Value<boolean>
  ariaControls?: Value<string>
  ariaLabel?: Value<string>
} & LinkAction

function SidebarUrlLink(options: UrlAction, ...children: TNode[]) {
  return Anchor({ href: options.href, withViewTransition: true }, ...children)
}

function SidebarActiveLink(...children: TNode[]) {
  return html.span(...children)
}

function SidebarClickLink(
  options: ClickAction &
    Partial<
      Pick<SidebarLinkOptions, 'ariaExpanded' | 'ariaControls' | 'ariaLabel'>
    >,
  ...children: TNode[]
) {
  return html.button(
    on.click(options.onClick),
    // Add ARIA attributes if provided using WithElement for dynamic updates
    WithElement(el => {
      if (options.ariaExpanded != null) {
        const updateExpanded = (expanded: boolean) => {
          el.setAttribute('aria-expanded', String(expanded))
        }
        // Set initial value
        updateExpanded(Value.get(options.ariaExpanded))
        // Subscribe to changes if it's a signal
        if (
          typeof options.ariaExpanded === 'object' &&
          'on' in options.ariaExpanded
        ) {
          options.ariaExpanded.on(updateExpanded)
        }
      }
      if (options.ariaControls != null) {
        const updateControls = (controls: string) => {
          el.setAttribute('aria-controls', controls)
        }
        updateControls(Value.get(options.ariaControls))
        if (
          typeof options.ariaControls === 'object' &&
          'on' in options.ariaControls
        ) {
          options.ariaControls.on(updateControls)
        }
      }
      if (options.ariaLabel != null) {
        const updateLabel = (label: string) => {
          el.setAttribute('aria-label', label)
        }
        updateLabel(Value.get(options.ariaLabel))
        if (
          typeof options.ariaLabel === 'object' &&
          'on' in options.ariaLabel
        ) {
          options.ariaLabel.on(updateLabel)
        }
      }
    }),
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
