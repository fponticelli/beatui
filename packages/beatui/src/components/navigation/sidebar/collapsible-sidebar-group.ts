import { attr, html, TNode, Value } from '@tempots/dom'
import { SidebarGroup } from './sidebar-group'
import { Collapse } from '@/components/layout'
import { SidebarLink } from './sidebar-link'
import { Icon } from '@/components/data'
import { sessionId } from '../../../utils/session-id'

export type CollapsibleSidebarGroupOptions = {
  icon?: Value<string>
  header: TNode
  rail?: Value<boolean>
  startOpen?: Value<boolean>
}

export function CollapsibleSidebarGroup(
  {
    rail = true,
    icon,
    header,
    startOpen = true,
  }: CollapsibleSidebarGroupOptions,
  ...children: TNode[]
) {
  const open = Value.deriveProp(startOpen)
  // Generate unique IDs for accessibility
  const groupId = sessionId('sidebar-group')
  const contentId = `${groupId}-content`

  return SidebarGroup(
    {},
    attr.class('bc-sidebar-group-collapsible'),
    attr.class(
      open.map((v): string =>
        v
          ? 'bc-sidebar-group-collapsible--open'
          : 'bc-sidebar-group-collapsible--closed'
      )
    ),
    // Add ARIA attributes for group
    attr.role('group'),
    attr.id(groupId),
    SidebarLink({
      icon,
      onClick: () => open.update(v => !v),
      // Add ARIA attributes for the toggle button
      ariaExpanded: open,
      ariaControls: contentId,
      right: html.span(
        attr.class('bc-sidebar-group-collapsible-indicator'),
        Icon({ icon: 'lucide:chevron-down', color: 'base' })
      ),
      content: header,
    }),
    SidebarGroup({ rail }, attr.id(contentId), Collapse({ open }, ...children))
  )
}
