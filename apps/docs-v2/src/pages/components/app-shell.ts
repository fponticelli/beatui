import { AppShell, Button, Stack, Group } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'AppShell',
  category: 'Layout',
  component: 'AppShell',
  description:
    'A responsive application layout shell using CSS Grid with structured sections for banner, header, menu, main content, aside, and footer.',
  icon: 'lucide:layout-dashboard',
  order: 8,
}

function DemoAppShell(options: {
  showBanner?: boolean
  showMenu?: boolean
  showAside?: boolean
  showFooter?: boolean
  showMainHeader?: boolean
  showMainFooter?: boolean
}) {
  return html.div(
    attr.class('h-80 border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700'),
    AppShell({
      ...(options.showBanner
        ? {
            banner: {
              content: html.div(
                attr.class(
                  'flex items-center justify-center h-full text-xs font-medium bg-primary-600 text-white'
                ),
                'Announcement banner'
              ),
              height: 32,
              color: 'primary',
            },
          }
        : {}),
      header: {
        content: html.div(
          attr.class('flex items-center gap-3 px-4 h-full'),
          html.span(attr.class('font-semibold text-sm'), 'My Application'),
          html.div(attr.class('flex-1')),
          Button({ variant: 'light', size: 'sm', color: 'base' }, 'Settings')
        ),
        height: 56,
        shadow: 'sm',
      },
      ...(options.showMenu
        ? {
            menu: {
              content: html.nav(
                attr.class('p-3'),
                Stack(
                  ...[
                    'Dashboard',
                    'Projects',
                    'Team',
                    'Reports',
                    'Settings',
                  ].map(item =>
                    html.a(
                      attr.class(
                        'block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                      ),
                      item
                    )
                  )
                )
              ),
              width: 220,
            },
          }
        : {}),
      ...(options.showMainHeader
        ? {
            mainHeader: {
              content: html.div(
                attr.class(
                  'flex items-center px-4 h-full border-b border-gray-200 dark:border-gray-700'
                ),
                html.h2(attr.class('text-sm font-semibold'), 'Page Title')
              ),
              height: 44,
            },
          }
        : {}),
      main: {
        content: html.div(
          attr.class('p-4 overflow-auto h-full'),
          html.p(
            attr.class('text-sm text-gray-500 dark:text-gray-400'),
            'Main content area'
          )
        ),
        color: 'base',
      },
      ...(options.showMainFooter
        ? {
            mainFooter: {
              content: html.div(
                attr.class(
                  'flex items-center px-4 h-full border-t border-gray-200 dark:border-gray-700'
                ),
                html.p(attr.class('text-xs text-gray-500'), 'Status bar')
              ),
              height: 36,
            },
          }
        : {}),
      ...(options.showAside
        ? {
            aside: {
              content: html.div(
                attr.class('p-3'),
                html.p(attr.class('text-xs text-gray-500 font-medium uppercase mb-2'), 'Details'),
                html.p(attr.class('text-sm text-gray-600 dark:text-gray-400'), 'Sidebar content')
              ),
              width: 200,
            },
          }
        : {}),
      ...(options.showFooter
        ? {
            footer: {
              content: html.div(
                attr.class(
                  'flex items-center justify-between px-4 h-full text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700'
                ),
                html.span('© 2024 My Application'),
                html.span('v1.0.0')
              ),
              height: 40,
            },
          }
        : {}),
    })
  )
}

export default function AppShellPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('AppShell', signals =>
      html.div(
        attr.class('h-96 border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700'),
        AppShell({
          header: {
            content: html.div(
              attr.class('flex items-center gap-3 px-4 h-full'),
              html.span(attr.class('font-semibold text-sm'), 'My Application'),
              html.div(attr.class('flex-1')),
              Button({ variant: 'light', size: 'sm', color: 'base' }, 'Settings')
            ),
            height: 56,
            shadow: signals.shadow as never,
            color: signals.color as never,
          },
          menu: {
            content: html.nav(
              attr.class('p-3'),
              Stack(
                ...['Dashboard', 'Projects', 'Team', 'Settings'].map(item =>
                  html.a(
                    attr.class(
                      'block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                    ),
                    item
                  )
                )
              )
            ),
            width: 220,
          },
          main: {
            content: html.div(
              attr.class('p-4 overflow-auto h-full'),
              html.p(
                attr.class('text-sm text-gray-500 dark:text-gray-400'),
                'Main content area. Resize the window to see responsive behavior.'
              )
            ),
            color: 'base',
          },
          footer: {
            content: html.div(
              attr.class(
                'flex items-center justify-between px-4 h-full text-xs text-gray-500'
              ),
              html.span('© 2024 My Application'),
              html.span('v1.0.0')
            ),
            height: 40,
          },
        })
      )
    ),
    sections: [
      Section(
        'Header Only',
        () => DemoAppShell({}),
        'The simplest AppShell has just a header and main content area.'
      ),
      Section(
        'With Navigation Menu',
        () => DemoAppShell({ showMenu: true }),
        'Adding a menu creates a left navigation panel that collapses to a hamburger on small screens.'
      ),
      Section(
        'With Menu and Aside',
        () => DemoAppShell({ showMenu: true, showAside: true }),
        'A full three-column layout with left navigation and right sidebar.'
      ),
      Section(
        'With Banner and Footer',
        () => DemoAppShell({ showBanner: true, showMenu: true, showFooter: true }),
        'Optional banner and footer sections span the full width of the layout.'
      ),
      Section(
        'Full Layout',
        () =>
          DemoAppShell({
            showBanner: true,
            showMenu: true,
            showAside: true,
            showFooter: true,
            showMainHeader: true,
            showMainFooter: true,
          }),
        'All available sections: banner, header, menu, mainHeader, main, mainFooter, aside, footer.'
      ),
      Section(
        'Responsive Breakpoints',
        () =>
          html.div(
            attr.class('flex flex-col gap-2'),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'The AppShell responds to three layout tiers:'
            ),
            html.ul(
              attr.class('text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1'),
              html.li(
                html.strong('Large'),
                ' (above mediumBreakpoint): All panels visible in a three-column grid.'
              ),
              html.li(
                html.strong('Medium'),
                ' (between smallBreakpoint and mediumBreakpoint): Menu pinned, aside collapses to toggle button.'
              ),
              html.li(
                html.strong('Small'),
                ' (at or below smallBreakpoint): All panels collapse, header shows hamburger buttons.'
              )
            ),
            html.p(
              attr.class('text-sm text-gray-500 dark:text-gray-400 mt-2'),
              'Use mediumBreakpoint (default: "md") and smallBreakpoint (default: "sm") to customize the tier thresholds.'
            )
          ),
        'Configure mediumBreakpoint and smallBreakpoint to control when panels collapse.'
      ),
      Section(
        'Section Configuration',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'Horizontal sections (banner, header, footer, mainHeader, mainFooter) accept:'
            ),
            html.ul(
              attr.class('text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1'),
              html.li(html.code(attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'), 'content'), ' — The TNode content to render'),
              html.li(html.code(attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'), 'height'), ' — Fixed height in px or per-breakpoint object'),
              html.li(html.code(attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'), 'color'), ' — Panel background color (PanelColor)'),
              html.li(html.code(attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'), 'shadow'), ' — Panel edge shadow depth')
            ),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400 mt-2'),
              'Vertical sections (menu, aside) use width instead of height.'
            )
          ),
        'Each section is independently configurable with content, dimensions, color, and shadow.'
      ),
    ],
  })
}
