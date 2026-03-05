import {
  Icon,
  Sidebar,
  SidebarGroup,
  SidebarLink,
  Stack,
  Group,
} from '@tempots/beatui'
import { attr } from '@tempots/dom'
import { categories } from '../registry/page-registry'

const SectionHeader = (icon: string, label: string) =>
  Group(attr.class('gap-1'), Icon({ icon, size: 'xs' }), label)

export function SidebarMenu() {
  return Stack(
    attr.class('h-full overflow-y-auto bg-gray-100 dark:bg-gray-900'),
    Sidebar(
      {},
      SidebarGroup(
        { header: SectionHeader('lucide:home', 'Home'), rail: true },
        SidebarLink({ href: '/', content: 'Overview' })
      ),
      ...categories.map(cat =>
        SidebarGroup(
          {
            header: SectionHeader(cat.icon, cat.name),
            rail: true,
          },
          ...cat.pages.map(page =>
            SidebarLink({
              href: `/components/${page.slug}`,
              content: page.name,
            })
          )
        )
      )
    )
  )
}
