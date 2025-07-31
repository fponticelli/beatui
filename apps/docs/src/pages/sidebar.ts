import { Sidebar, SidebarLink, CollapsibleSidebarGroup } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'

export const SidebarPage = () => {
  return html.div(
    attr.class(
      'bu-flex bu-h-screen bu-w-full bu-overflow-auto bu-p-4 bu-gap-4'
    ),
    // Light background mode sidebar (default)
    Sidebar(
      { backgroundMode: 'light' },
      attr.class('bu-w-80 bu-border'),
      CollapsibleSidebarGroup(
        {
          icon: 'lucide:home',
          header: 'Light Mode',
          rail: true,
          startOpen: true,
        },
        SidebarLink({ href: '/sidebar', content: 'Active Link' }),
        SidebarLink({ href: '/button', content: 'Inactive Link' }),
        SidebarLink({
          onClick: () => {
            console.log('Button clicked')
          },
          content: 'Clickable Link',
        }),
        SidebarLink({
          href: '/sidebar',
          icon: 'lucide:home',
          content: 'Active Link with Icon',
        }),
        SidebarLink({
          href: '/button',
          icon: 'lucide:cog',
          content: 'Inactive Link with Icon',
        }),
        SidebarLink({
          icon: 'lucide:bell',
          onClick: () => {
            console.log('Button clicked')
          },
          content: 'Clickable Link with Icon',
        }),
        SidebarLink({
          href: '/sidebar',
          icon: 'lucide:home',
          content: 'Active Link with Action',
          action: {
            icon: 'lucide:more-horizontal',
            onClick: () => {
              console.log('Action clicked')
            },
          },
        })
      )
    ),
    // Dark background mode sidebar
    html.br(),
    Sidebar(
      { backgroundMode: 'dark' },
      attr.class('bu-w-80 bu-border'),
      CollapsibleSidebarGroup(
        {
          icon: 'lucide:moon',
          header: 'Dark Mode',
          rail: true,
          startOpen: true,
        },
        SidebarLink({ href: '/sidebar', content: 'Active Link' }),
        SidebarLink({ href: '/button', content: 'Inactive Link' }),
        SidebarLink({
          onClick: () => {
            console.log('Button clicked')
          },
          content: 'Clickable Link',
        }),
        SidebarLink({
          href: '/sidebar',
          icon: 'lucide:home',
          content: 'Active Link with Icon',
        }),
        SidebarLink({
          href: '/button',
          icon: 'lucide:cog',
          content: 'Inactive Link with Icon',
        }),
        SidebarLink({
          icon: 'lucide:bell',
          onClick: () => {
            console.log('Button clicked')
          },
          content: 'Clickable Link with Icon',
        }),
        SidebarLink({
          href: '/sidebar',
          icon: 'lucide:home',
          content: 'Active Link with Action',
          action: {
            icon: 'lucide:more-horizontal',
            onClick: () => {
              console.log('Action clicked')
            },
          },
        })
      )
    )
  )
}
