import {
  CollapsibleSidebarGroup,
  Sidebar,
  SidebarLink,
  Stack,
} from '@tempots/beatui'
import { attr } from '@tempots/dom'
import { categories } from '../registry/page-registry'
import { MODULES } from '../api/api-data'

export function SidebarMenu() {
  return Stack(
    attr.class('h-full overflow-y-auto bg-gray-100 dark:bg-gray-900'),
    Sidebar(
      {},
      ...categories.map(cat =>
        CollapsibleSidebarGroup(
          {
            icon: cat.icon,
            header: cat.name,
            startOpen: false,
          },
          ...cat.pages.map(page =>
            SidebarLink({
              href: `/components/${page.slug}`,
              content: page.name,
            })
          )
        )
      ),
      CollapsibleSidebarGroup(
        {
          icon: 'lucide:book-open',
          header: 'API Reference',
          startOpen: false,
        },
        SidebarLink({ href: '/api', content: 'Overview' }),
        ...MODULES.map(mod =>
          SidebarLink({
            href: `/api/${mod.slug}`,
            content: mod.displayName,
          })
        )
      )
    )
  )
}
