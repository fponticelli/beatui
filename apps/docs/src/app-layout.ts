import { html, attr, TNode } from '@tempots/dom'
import {
  StandaloneAppearanceSelector,
  AppShell,
  Group,
  LocaleSelector,
} from '@tempots/beatui'
import { Anchor } from '@tempots/ui'
import { Menu } from './views/menu'

export function AppLayout({ children }: { children: TNode }) {
  return AppShell({
    menu: {
      content: Menu(),
    },
    header: {
      content: Group(
        attr.class('bu-h-full bu-justify-between bu-items-center'),
        Anchor(
          { href: '/', withViewTransition: true },
          attr.class('bu-h-full bu-p-2 bu-flex-grow'),
          html.img(attr.class('bu-h-full'), attr.src('/beatui-logo.png'))
        ),
        html.div(
          LocaleSelector({
            locales: [
              { code: 'en', name: 'English' },
              { code: 'es', name: 'Español' },
              { code: 'fr', name: 'Français' },
              { code: 'it', name: 'Italiano' },
              { code: 'pt', name: 'Português' },
            ],
          })
        ),
        html.div(attr.class('bu-pr-4'), StandaloneAppearanceSelector())
      ),
    },
    main: {
      content: html.div(attr.class('bu-h-full bu-overflow-hidden'), children),
    },
  })
}
