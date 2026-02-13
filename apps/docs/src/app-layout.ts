import { html, attr, TNode, Use } from '@tempots/dom'
import {
  StandaloneAppearanceSelector,
  AppShell,
  Group,
  LocaleSelector,
  BeatUII18n,
  LocaleItem,
} from '@tempots/beatui'
import { Anchor } from '@tempots/ui'
import { Menu } from './views/menu'

export function AppLayout({ children }: { children: TNode }) {
  return AppShell({
    menu: {
      width: 240,
      content: Menu(),
    },
    header: {
      content: Group(
        attr.class(
          'h-full justify-between items-center bg-gray-100 dark:bg-gray-900'
        ),
        Anchor(
          { href: '/', viewTransition: true },
          attr.class('h-full p-2 flex-grow'),
          html.img(attr.class('h-full'), attr.src('/beatui-logo.png'))
        ),
        html.div(
          Use(BeatUII18n, t =>
            LocaleSelector({
              locales: t.map(
                t =>
                  [
                    { code: 'en', name: t.en, nativeName: 'English' },
                    { code: 'es', name: t.es, nativeName: 'Español' },
                    { code: 'fr', name: t.fr, nativeName: 'Français' },
                    { code: 'it', name: t.it, nativeName: 'Italiano' },
                    { code: 'pt', name: t.pt, nativeName: 'Português' },
                    { code: 'de', name: t.de, nativeName: 'Deutsch' },
                    { code: 'pl', name: t.pl, nativeName: 'Polski' },
                    { code: 'ar', name: t.ar, nativeName: 'العربية ' },
                    { code: 'ja', name: t.ja, nativeName: '日本語' },
                    { code: 'ko', name: t.ko, nativeName: '한국어' },
                    { code: 'ru', name: t.ru, nativeName: 'Русский' },
                    { code: 'tr', name: t.tr, nativeName: 'Türkçe' },
                    { code: 'nl', name: t.nl, nativeName: 'Nederlands' },
                    { code: 'vi', name: t.vi, nativeName: 'Tiếng Việt' },
                    { code: 'hi', name: t.hi, nativeName: 'हिंदी' },
                    { code: 'zh', name: t.zh, nativeName: '中文' },
                    { code: 'fa', name: t.fa, nativeName: 'فارسی' },
                    { code: 'ur', name: t.ur, nativeName: 'اردو' },
                    { code: 'he', name: t.he, nativeName: 'עברית' },
                  ] as LocaleItem[]
              ),
            })
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
