import { Group, SidebarGroup, SidebarLink, Stack, Tag } from '@tempots/beatui'
import { attr } from '@tempots/dom'

const TodoTag = () => Tag({ value: 'TODO', color: 'red', size: 'xs' })

const Todo = (content: string) =>
  Group(attr.class('bu-justify-between'), content, TodoTag())

export function Menu() {
  return Stack(
    attr.class('bu-h-full bu-overflow-y-auto bu-p-4'),
    SidebarGroup(
      {},
      SidebarLink({ href: '/button', content: 'Button' }),
      SidebarLink({ href: '/switch', content: 'Switch' }),
      SidebarLink({ href: '/collapse', content: 'Collapse' }),
      SidebarLink({ href: '/icon', content: 'Icon' }),
      SidebarLink({ href: '/link', content: 'Link' }),
      SidebarLink({ href: '/modal', content: 'Modal' }),
      SidebarLink({ href: '/drawer', content: 'Drawer' }),
      SidebarLink({ href: '/tooltip', content: 'Tooltip' }),
      SidebarLink({ href: '/flyout', content: 'Flyout' }),
      SidebarLink({ href: '/scrollable-panel', content: 'Scrollable Panel' }),
      SidebarLink({ href: '/rtl-ltr', content: 'RTL/LTR Support' }),
      SidebarLink({ href: '/segmented-control', content: 'Segmented Control' }),
      SidebarLink({ href: '/sidebar', content: 'Sidebar' }),
      SidebarLink({
        href: '/tags',
        content: Todo('Tags'),
      }),
      SidebarLink({ href: '/form', content: 'Form' }),
      SidebarLink({ href: '/editable-text', content: Todo('Editable Text') }),
      SidebarLink({ href: '/breakpoint', content: 'Breakpoint' })
    )
  )
}
