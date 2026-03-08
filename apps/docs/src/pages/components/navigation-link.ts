import { NavigationLink } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NavigationLink',
  category: 'Navigation',
  component: 'NavigationLink',
  description:
    'A styled navigation link that automatically detects the active route and disables itself when the current URL matches.',
  icon: 'lucide:navigation',
  order: 8,
}

export default function NavigationLinkPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('NavigationLink', _signals =>
      html.div(
        attr.class('flex flex-wrap gap-4'),
        NavigationLink(
          { href: '/docs', color: 'primary', variant: 'default' },
          'Documentation'
        ),
        NavigationLink(
          { href: '/components', color: 'primary', variant: 'hover' },
          'Components'
        ),
        NavigationLink(
          { href: '/about', color: 'primary', variant: 'plain' },
          'About'
        )
      )
    ),
    sections: [
      Section(
        'Basic Navigation Links',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6'),
            NavigationLink({ href: '/home', color: 'primary' }, 'Home'),
            NavigationLink({ href: '/docs', color: 'primary' }, 'Docs'),
            NavigationLink({ href: '/blog', color: 'primary' }, 'Blog'),
            NavigationLink({ href: '/contact', color: 'primary' }, 'Contact')
          ),
        'NavigationLink renders as an interactive anchor. When its href matches the current page URL, it becomes disabled (non-interactive) automatically.'
      ),
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6'),
            NavigationLink(
              { href: '/default', variant: 'default', color: 'primary' },
              'Default (underline)'
            ),
            NavigationLink(
              { href: '/hover', variant: 'hover', color: 'primary' },
              'Hover underline'
            ),
            NavigationLink(
              { href: '/plain', variant: 'plain', color: 'primary' },
              'Plain (no underline)'
            )
          ),
        'Inherits all three link variants from the Link component: default, hover, and plain.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6'),
            NavigationLink({ href: '/primary', color: 'primary' }, 'Primary'),
            NavigationLink(
              { href: '/secondary', color: 'secondary' },
              'Secondary'
            ),
            NavigationLink({ href: '/success', color: 'success' }, 'Success'),
            NavigationLink({ href: '/danger', color: 'danger' }, 'Danger'),
            NavigationLink({ href: '/warning', color: 'warning' }, 'Warning'),
            NavigationLink({ href: '/info', color: 'info' }, 'Info')
          ),
        'All theme colors are supported.'
      ),
      Section(
        'Match Modes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'Control when the link is considered active using the matchMode prop.'
            ),
            html.div(
              attr.class('flex flex-wrap gap-6'),
              html.div(
                attr.class('flex flex-col gap-1'),
                html.span(
                  attr.class('text-xs text-gray-500 dark:text-gray-400'),
                  'matchMode="exact" (default)'
                ),
                NavigationLink(
                  { href: '/settings', matchMode: 'exact', color: 'primary' },
                  '/settings'
                )
              ),
              html.div(
                attr.class('flex flex-col gap-1'),
                html.span(
                  attr.class('text-xs text-gray-500 dark:text-gray-400'),
                  'matchMode="prefix"'
                ),
                NavigationLink(
                  { href: '/docs', matchMode: 'prefix', color: 'primary' },
                  '/docs/*'
                )
              ),
              html.div(
                attr.class('flex flex-col gap-1'),
                html.span(
                  attr.class('text-xs text-gray-500 dark:text-gray-400'),
                  'matchMode="params"'
                ),
                NavigationLink(
                  {
                    href: '/search?q=tempo',
                    matchMode: 'params',
                    color: 'primary',
                  },
                  '/search?q=tempo'
                )
              )
            )
          ),
        'Use matchMode to control URL comparison: exact requires a full match, prefix activates on any sub-path, params compares pathname and search parameters.'
      ),
      Section(
        'Keep Active Links Enabled',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-6'),
            NavigationLink(
              { href: '/current-page', disableWhenActive: false, color: 'primary' },
              'Always clickable'
            ),
            NavigationLink(
              { href: '/other-page', disableWhenActive: true, color: 'primary' },
              'Disables when active'
            )
          ),
        'Set disableWhenActive to false if you need the link to remain interactive even on the matching page.'
      ),
      Section(
        'In a Nav Bar',
        () =>
          html.nav(
            attr.class(
              'flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800'
            ),
            NavigationLink(
              { href: '/', matchMode: 'exact', color: 'primary', variant: 'plain' },
              'Home'
            ),
            NavigationLink(
              { href: '/components', matchMode: 'prefix', color: 'primary', variant: 'plain' },
              'Components'
            ),
            NavigationLink(
              { href: '/guides', matchMode: 'prefix', color: 'primary', variant: 'plain' },
              'Guides'
            ),
            NavigationLink(
              { href: '/changelog', matchMode: 'exact', color: 'primary', variant: 'plain' },
              'Changelog'
            )
          ),
        'NavigationLink is designed for top-level navigation bars and sidebars where the active route should be visually indicated.'
      ),
    ],
  })
}
