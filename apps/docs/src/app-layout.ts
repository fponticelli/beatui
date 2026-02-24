import { html, attr, prop, style, TNode, Use } from '@tempots/dom'
import {
  StandaloneAppearanceSelector,
  AppShell,
  Group,
  LocaleSelector,
  BeatUII18n,
  LocaleItem,
  Theme,
  NumberInput,
  Label,
} from '@tempots/beatui'
import { Anchor } from '@tempots/ui'
import { Menu } from './views/menu'

export function AppLayout({ children }: { children: TNode }) {
  const spacingBase = prop(0.25)
  const fontSizeBase = prop(1)

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
          attr.class('flex flex-row gap-3 items-center'),
          Label('Spacing'),
          NumberInput({
            value: spacingBase,
            onChange: v => spacingBase.set(v),
            min: 0.05,
            max: 1,
            step: 0.05,
            size: 'xs',
          }),
          Label('Font Size'),
          NumberInput({
            value: fontSizeBase,
            onChange: v => fontSizeBase.set(v),
            min: 0.5,
            max: 2,
            step: 0.05,
            size: 'xs',
          })
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
      content: html.div(
        attr.class('h-full overflow-auto'),
        style.variable(
          '--spacing-base',
          spacingBase.map(v => `${v}rem`)
        ),
        style.variable(
          '--font-size-base',
          fontSizeBase.map(v => `${v}rem`)
        ),
        children
      ),
    },
  })
}
