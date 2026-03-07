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
  // Read current path at construction time to auto-open the matching category
  const currentPath = window.location.pathname

  const isGuide = currentPath.startsWith('/guides')

  return Stack(
    attr.class('h-full overflow-y-auto bg-gray-100 dark:bg-gray-900'),
    Sidebar(
      {},
      CollapsibleSidebarGroup(
        {
          icon: 'lucide:book-text',
          header: 'Guides',
          startOpen: isGuide,
        },
        SidebarLink({ href: '/guides/getting-started', content: 'Getting Started' }),
        SidebarLink({ href: '/guides/theming', content: 'Theming' }),
        SidebarLink({ href: '/guides/customization', content: 'Customization' }),
        SidebarLink({ href: '/guides/css-variables', content: 'CSS Variables' }),
        SidebarLink({ href: '/guides/forms', content: 'Forms' }),
        SidebarLink({ href: '/guides/rtl-ltr', content: 'RTL & LTR' }),
        SidebarLink({ href: '/guides/data-source', content: 'DataSource' }),
        SidebarLink({ href: '/guides/authentication', content: 'Authentication' })
      ),
      ...categories.map(cat => {
        const containsCurrentPage = cat.pages.some(
          page => currentPath === `/components/${page.slug}`
        )
        return CollapsibleSidebarGroup(
          {
            icon: cat.icon,
            header: cat.name,
            startOpen: containsCurrentPage,
          },
          ...cat.pages.map(page =>
            SidebarLink({
              href: `/components/${page.slug}`,
              content: page.name,
            })
          )
        )
      }),
      CollapsibleSidebarGroup(
        {
          icon: 'lucide:book-open',
          header: 'API Reference',
          startOpen: currentPath.startsWith('/api'),
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
