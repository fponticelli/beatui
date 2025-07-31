import { html, attr, TNode, Use, computedOf } from '@tempots/dom'
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
          Use(BeatUII18n, t =>
            LocaleSelector({
              locales: computedOf(
                t.en(),
                t.es(),
                t.fr(),
                t.it(),
                t.pt(),
                t.de(),
                t.pl(),
                t.ar(),
                t.ja(),
                t.ko(),
                t.ru(),
                t.tr(),
                t.nl(),
                t.vi(),
                t.hi(),
                t.zh()
              )(
                (
                  en,
                  es,
                  fr,
                  it,
                  pt,
                  de,
                  pl,
                  ar,
                  ja,
                  ko,
                  ru,
                  tr,
                  nl,
                  vi,
                  hi,
                  zh
                ) =>
                  [
                    { code: 'en', name: en, nativeName: 'English' },
                    { code: 'es', name: es, nativeName: 'Español' },
                    { code: 'fr', name: fr, nativeName: 'Français' },
                    { code: 'it', name: it, nativeName: 'Italiano' },
                    { code: 'pt', name: pt, nativeName: 'Português' },
                    { code: 'de', name: de, nativeName: 'Deutsch' },
                    { code: 'pl', name: pl, nativeName: 'Polski' },
                    { code: 'ar', name: ar, nativeName: 'العربية ' },
                    { code: 'ja', name: ja, nativeName: '日本語' },
                    { code: 'ko', name: ko, nativeName: '한국어' },
                    { code: 'ru', name: ru, nativeName: 'Русский' },
                    { code: 'tr', name: tr, nativeName: 'Türkçe' },
                    { code: 'nl', name: nl, nativeName: 'Nederlands' },
                    { code: 'vi', name: vi, nativeName: 'Tiếng Việt' },
                    { code: 'hi', name: hi, nativeName: 'हिंदी' },
                    { code: 'zh', name: zh, nativeName: '中文' },
                  ] as LocaleItem[]
              ),
            })
          )
        ),
        html.div(attr.class('bu-pr-4'), StandaloneAppearanceSelector())
      ),
    },
    main: {
      content: html.div(attr.class('bu-h-full bu-overflow-hidden'), children),
    },
  })
}
