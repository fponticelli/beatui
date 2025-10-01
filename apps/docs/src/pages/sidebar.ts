import {
  Sidebar,
  SidebarLink,
  CollapsibleSidebarGroup,
  ScrollablePanel,
  Group,
} from '@tempots/beatui'
import { html, attr } from '@tempots/dom'

export default function SidebarPage() {
  return ScrollablePanel({
    body: Group(
      attr.class('p-4 gap-4'),
      // Light background mode sidebar (default)
      Sidebar(
        { backgroundMode: 'light' },
        attr.class('w-80 border'),
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
        attr.class('w-80 border'),
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
    ),
  })
}
