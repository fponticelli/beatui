import { html, attr, TNode, Use } from '@tempots/dom'
import {
  StandaloneAppearanceSelector,
  AppShell,
  Group,
  Theme,
} from '@tempots/beatui'
import { Anchor } from '@tempots/ui'
import { SidebarMenu } from './views/sidebar-menu'

export function AppLayout({ children }: { children: TNode }) {
  return AppShell({
    menu: {
      width: 240,
      content: SidebarMenu(),
    },
    header: {
      content: Group(
        attr.class(
          'h-full justify-between items-center bg-gray-100 dark:bg-gray-900'
        ),
        Anchor(
          { href: '/', viewTransition: true },
          attr.class('h-full p-2 flex-grow'),
          Use(Theme, ({ appearance }) =>
            html.img(
              attr.class('h-full'),
              attr.src(
                appearance.map((a): string =>
                  a === 'dark' ? '/beatui-logo-dark.svg' : '/beatui-logo.svg'
                )
              )
            )
          )
        ),
        html.div(attr.class('px-2'), StandaloneAppearanceSelector())
      ),
    },
    main: {
      content: html.div(attr.class('h-full overflow-auto'), children),
    },
  })
}
