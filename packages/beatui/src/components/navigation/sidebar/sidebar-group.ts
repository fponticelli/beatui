import { Stack } from '../../layout'
import { attr, html, TNode, Value } from '@tempots/dom'

/**
 * Configuration options for the {@link SidebarGroup} component.
 */
export type SidebarGroupOptions = {
  /**
   * Whether to render the group in compact "rail" mode, typically used for
   * icon-only sidebar layouts.
   * @default false
   */
  rail?: Value<boolean>
  /**
   * Optional header content displayed above the group of sidebar links.
   * Typically a section title or label.
   */
  header?: TNode
}

/**
 * Groups related sidebar links under an optional header within a {@link Sidebar}.
 *
 * Renders as a vertical stack with an optional header section and a container
 * for child links. Supports a compact "rail" mode for icon-only sidebars.
 *
 * @param options - Configuration options for the sidebar group
 * @param children - Child content, typically {@link SidebarLink} components
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * SidebarGroup(
 *   { header: html.span('Main Navigation') },
 *   SidebarLink({ content: 'Home', icon: 'home', href: '/' }),
 *   SidebarLink({ content: 'About', icon: 'info', href: '/about' }),
 *   SidebarLink({ content: 'Contact', icon: 'mail', href: '/contact' }),
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Rail mode (icon-only)
 * SidebarGroup(
 *   { rail: true },
 *   SidebarLink({ content: '', icon: 'home', href: '/' }),
 *   SidebarLink({ content: '', icon: 'settings', href: '/settings' }),
 * )
 * ```
 */
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
