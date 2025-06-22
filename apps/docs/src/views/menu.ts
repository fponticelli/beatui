import { SidebarGroup, SidebarLink, Stack } from '@tempots/beatui'
import { attr } from '@tempots/dom'

export function Menu() {
  return Stack(
    attr.class('bu-h-full bu-overflow-y-auto bu-p-4'),
    SidebarGroup(
      {},
      SidebarLink({ href: '/button', content: 'Button' }),
      SidebarLink({ href: '/switch', content: 'Switch' }),
      SidebarLink({ href: '/collapse', content: 'Collapse' }),
      SidebarLink({ href: '/icon', content: 'Icon' }),
      SidebarLink({ href: '/modal', content: 'Modal' }),
      SidebarLink({ href: '/segmented-control', content: 'Segmented Control' }),
      SidebarLink({ href: '/sidebar', content: 'Sidebar' }),
      SidebarLink({ href: '/tags', content: 'Tags' }),
      SidebarLink({ href: '/form', content: 'Form' }),
      SidebarLink({ href: '/editable-text', content: 'Editable Text' }),
      SidebarLink({ href: '/breakpoint', content: 'Breakpoint' })
    )
  )
}
