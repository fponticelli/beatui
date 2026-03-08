import {
  Sidebar,
  SidebarGroup,
  SidebarLink,
  SidebarSeparator,
  CollapsibleSidebarGroup,
  Icon,
} from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Sidebar',
  category: 'Navigation',
  component: 'Sidebar',
  description:
    'Vertical navigation panel with grouped links, collapsible sections, and support for light and dark background modes.',
  icon: 'lucide:panel-left',
  order: 5,
}

export default function SidebarPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Sidebar', signals =>
      html.div(
        attr.class('w-64 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'),
        Sidebar(
          { backgroundMode: signals.backgroundMode },
          SidebarGroup(
            { header: html.span('Main') },
            SidebarLink({
              content: 'Dashboard',
              icon: 'lucide:layout-dashboard',
              onClick: () => {},
            }),
            SidebarLink({
              content: 'Analytics',
              icon: 'lucide:bar-chart-2',
              onClick: () => {},
            }),
            SidebarLink({
              content: 'Projects',
              icon: 'lucide:folder',
              onClick: () => {},
            })
          ),
          CollapsibleSidebarGroup(
            { header: html.span('Settings'), icon: 'lucide:settings' },
            SidebarLink({
              content: 'Profile',
              icon: 'lucide:user',
              onClick: () => {},
            }),
            SidebarLink({
              content: 'Preferences',
              icon: 'lucide:sliders',
              onClick: () => {},
            })
          )
        )
      )
    ),
    sections: [
      Section(
        'Basic Sidebar',
        () =>
          html.div(
            attr.class('w-64 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'),
            Sidebar(
              {},
              SidebarGroup(
                {},
                SidebarLink({
                  content: 'Home',
                  icon: 'lucide:home',
                  onClick: () => {},
                }),
                SidebarLink({
                  content: 'Search',
                  icon: 'lucide:search',
                  onClick: () => {},
                }),
                SidebarLink({
                  content: 'Settings',
                  icon: 'lucide:settings',
                  onClick: () => {},
                })
              )
            )
          ),
        'A minimal sidebar with icon links grouped in a single section.'
      ),
      Section(
        'With Group Headers',
        () =>
          html.div(
            attr.class('w-64 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'),
            Sidebar(
              {},
              SidebarGroup(
                { header: html.span('Overview') },
                SidebarLink({
                  content: 'Dashboard',
                  icon: 'lucide:layout-dashboard',
                  onClick: () => {},
                }),
                SidebarLink({
                  content: 'Reports',
                  icon: 'lucide:file-bar-chart',
                  onClick: () => {},
                })
              ),
              SidebarGroup(
                { header: html.span('Account') },
                SidebarLink({
                  content: 'Profile',
                  icon: 'lucide:user',
                  onClick: () => {},
                }),
                SidebarLink({
                  content: 'Billing',
                  icon: 'lucide:credit-card',
                  onClick: () => {},
                })
              )
            )
          ),
        'Use SidebarGroup with a header to create labeled navigation sections.'
      ),
      Section(
        'Collapsible Groups',
        () =>
          html.div(
            attr.class('w-64 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'),
            Sidebar(
              {},
              CollapsibleSidebarGroup(
                {
                  header: html.span('Products'),
                  icon: 'lucide:package',
                  startOpen: true,
                },
                SidebarLink({
                  content: 'Catalog',
                  icon: 'lucide:list',
                  onClick: () => {},
                }),
                SidebarLink({
                  content: 'Inventory',
                  icon: 'lucide:warehouse',
                  onClick: () => {},
                })
              ),
              CollapsibleSidebarGroup(
                {
                  header: html.span('Support'),
                  icon: 'lucide:life-buoy',
                  startOpen: false,
                },
                SidebarLink({
                  content: 'Tickets',
                  icon: 'lucide:ticket',
                  onClick: () => {},
                }),
                SidebarLink({
                  content: 'Documentation',
                  icon: 'lucide:book-open',
                  onClick: () => {},
                })
              )
            )
          ),
        'CollapsibleSidebarGroup adds expand/collapse behavior to a sidebar section.'
      ),
      Section(
        'Dark Background Mode',
        () =>
          html.div(
            attr.class('w-64 rounded-lg overflow-hidden'),
            Sidebar(
              { backgroundMode: 'dark' },
              SidebarGroup(
                { header: html.span('Navigation') },
                SidebarLink({
                  content: 'Dashboard',
                  icon: 'lucide:layout-dashboard',
                  onClick: () => {},
                }),
                SidebarLink({
                  content: 'Analytics',
                  icon: 'lucide:bar-chart-2',
                  onClick: () => {},
                }),
                SidebarLink({
                  content: 'Team',
                  icon: 'lucide:users',
                  onClick: () => {},
                })
              )
            )
          ),
        'Set backgroundMode to "dark" for sidebars on dark-colored app shells.'
      ),
      Section(
        'SidebarLink with Action Button',
        () =>
          html.div(
            attr.class('w-64 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'),
            Sidebar(
              {},
              SidebarGroup(
                {},
                SidebarLink({
                  content: 'Projects',
                  icon: 'lucide:folder',
                  onClick: () => {},
                  action: {
                    icon: 'lucide:plus',
                    label: 'Create project',
                    onClick: () => alert('Create project clicked'),
                  },
                }),
                SidebarLink({
                  content: 'Team',
                  icon: 'lucide:users',
                  onClick: () => {},
                  action: {
                    icon: 'lucide:more-horizontal',
                    label: 'More options',
                    onClick: () => alert('More options clicked'),
                  },
                }),
                SidebarLink({
                  content: 'Settings',
                  icon: 'lucide:settings',
                  onClick: () => {},
                })
              )
            )
          ),
        'SidebarLink supports an optional inline action button rendered at the trailing edge, useful for quick actions like create, delete, or expand.'
      ),
      Section(
        'SidebarSeparator',
        () =>
          html.div(
            attr.class('w-64 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'),
            Sidebar(
              {},
              SidebarGroup(
                { header: html.span('Workspace') },
                SidebarLink({
                  content: 'Dashboard',
                  icon: 'lucide:layout-dashboard',
                  onClick: () => {},
                }),
                SidebarLink({
                  content: 'Projects',
                  icon: 'lucide:folder',
                  onClick: () => {},
                })
              ),
              SidebarSeparator(),
              SidebarGroup(
                { header: html.span('Account') },
                SidebarLink({
                  content: 'Profile',
                  icon: 'lucide:user',
                  onClick: () => {},
                }),
                SidebarLink({
                  content: 'Logout',
                  icon: 'lucide:log-out',
                  onClick: () => {},
                })
              )
            )
          ),
        'SidebarSeparator renders a horizontal rule between sidebar groups to visually divide sections.'
      ),
      Section(
        'With Right Badge',
        () =>
          html.div(
            attr.class('w-64 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'),
            Sidebar(
              {},
              SidebarGroup(
                {},
                SidebarLink({
                  content: 'Inbox',
                  icon: 'lucide:inbox',
                  after: html.span(
                    attr.class('text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 rounded-full px-2 py-0.5'),
                    '12'
                  ),
                  onClick: () => {},
                }),
                SidebarLink({
                  content: 'Notifications',
                  icon: 'lucide:bell',
                  after: html.span(
                    attr.class('text-xs font-medium bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300 rounded-full px-2 py-0.5'),
                    '3'
                  ),
                  onClick: () => {},
                }),
                SidebarLink({
                  content: 'Messages',
                  icon: 'lucide:message-square',
                  onClick: () => {},
                })
              )
            )
          ),
        'The right prop renders content at the trailing edge of a link, such as count badges.'
      ),
    ],
  })
}
