import { html, attr, TNode, Use } from '@tempots/dom'
import {
  StandaloneAppearanceSelector,
  AppShell,
  Group,
  Theme,
  LocaleSelector,
  BeatUII18n,
  type LocaleItem,
} from '@tempots/beatui'
import { Anchor } from '@tempots/ui'
import { SidebarMenu } from './views/sidebar-menu'
import { HeaderSearch } from './views/header-search'
import { Footer } from './views/footer'
import { PageBreadcrumbs } from './views/page-breadcrumbs'

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
        html.div(
          attr.class('flex items-center gap-2 px-2'),
          HeaderSearch(),
          Use(BeatUII18n, t =>
            LocaleSelector({
              locales: t.map(
                t =>
                  [
                    { code: 'en', name: t.en, nativeName: 'English' },
                    { code: 'es', name: t.es, nativeName: 'Espa\u00f1ol' },
                    { code: 'fr', name: t.fr, nativeName: 'Fran\u00e7ais' },
                    { code: 'it', name: t.it, nativeName: 'Italiano' },
                    { code: 'pt', name: t.pt, nativeName: 'Portugu\u00eas' },
                    { code: 'de', name: t.de, nativeName: 'Deutsch' },
                    {
                      code: 'ar',
                      name: t.ar,
                      nativeName: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629',
                    },
                    { code: 'ja', name: t.ja, nativeName: '\u65e5\u672c\u8a9e' },
                    {
                      code: 'ko',
                      name: t.ko,
                      nativeName: '\ud55c\uad6d\uc5b4',
                    },
                    { code: 'zh', name: t.zh, nativeName: '\u4e2d\u6587' },
                    {
                      code: 'he',
                      name: t.he,
                      nativeName: '\u05e2\u05d1\u05e8\u05d9\u05ea',
                    },
                  ] as LocaleItem[]
              ),
            })
          ),
          StandaloneAppearanceSelector({ size: 'sm' })
        )
      ),
    },
    main: {
      content: html.div(
        attr.class('h-full overflow-auto flex flex-col'),
        html.div(attr.class('px-6 py-2 border-b border-gray-100 dark:border-gray-800'), PageBreadcrumbs()),
        html.div(attr.class('flex-1'), children),
        Footer()
      ),
    },
  })
}
