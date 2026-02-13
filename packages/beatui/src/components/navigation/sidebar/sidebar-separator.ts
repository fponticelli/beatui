import { attr, html } from '@tempots/dom'

/**
 * Visual separator rendered as a horizontal rule within a {@link Sidebar}.
 *
 * Used to visually divide groups of sidebar links or sections.
 *
 * @returns A renderable `<hr>` node with the sidebar separator class
 *
 * @example
 * ```typescript
 * Sidebar(
 *   { backgroundMode: 'light' },
 *   SidebarGroup({ header: html.span('Section A') }, ...linksA),
 *   SidebarSeparator(),
 *   SidebarGroup({ header: html.span('Section B') }, ...linksB),
 * )
 * ```
 */
export function SidebarSeparator() {
  return html.hr(attr.class('bc-sidebar-separator'))
}
