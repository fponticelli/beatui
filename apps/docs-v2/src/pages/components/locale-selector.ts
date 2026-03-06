import { LocaleSelector, Card } from '@tempots/beatui'
import { html, attr, prop, Value, on } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'LocaleSelector',
  category: 'Navigation',
  component: 'LocaleSelector',
  description:
    'A dropdown for selecting the application locale. Reads the current locale from the Locale provider and optionally updates it when the user makes a selection.',
  icon: 'lucide:languages',
  order: 10,
}

const commonLocales = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol' },
  { code: 'fr', name: 'French', nativeName: 'Francais' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugues' },
  { code: 'ja', name: 'Japanese', nativeName: '\u65e5\u672c\u8a9e' },
  { code: 'zh', name: 'Chinese', nativeName: '\u4e2d\u6587' },
  { code: 'ar', name: 'Arabic', nativeName: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
]

export default function LocaleSelectorPage() {
  return ComponentPage(meta, {
    playground: html.div(
      attr.class('flex flex-col gap-4 items-center w-full'),
      html.p(
        attr.class('text-sm text-gray-500'),
        'LocaleSelector requires a Locale provider in the component tree.'
      ),
      html.div(
        attr.class('w-full max-w-xs'),
        LocaleSelector({
          locales: prop(commonLocales),
          updateLocale: false,
          onChange: value => console.log('Selected locale:', value),
        })
      )
    ),
    sections: [
      Section(
        'Basic Usage',
        () =>
          html.div(
            attr.class('w-full max-w-xs'),
            LocaleSelector({
              locales: prop([
                { code: 'en', name: 'English' },
                { code: 'es', name: 'Spanish', nativeName: 'Espanol' },
                { code: 'fr', name: 'French', nativeName: 'Francais' },
              ]),
              updateLocale: false,
              onChange: value => console.log('Locale changed to:', value),
            })
          ),
        'Render a locale selector with a list of locale options. When updateLocale is true (default), the Locale provider is updated automatically.'
      ),
      Section(
        'With Many Locales',
        () =>
          html.div(
            attr.class('w-full max-w-xs'),
            LocaleSelector({
              locales: prop(commonLocales),
              updateLocale: false,
              onChange: value => console.log('Selected:', value),
            })
          ),
        'Pass a full list of locales including native names. Native names are shown in parentheses when they differ from the display name.'
      ),
      Section(
        'Reactive Locale List',
        () => {
          const showAll = prop(false)
          const locales = showAll.map(all =>
            all
              ? commonLocales
              : [
                  { code: 'en', name: 'English' },
                  { code: 'es', name: 'Spanish', nativeName: 'Espanol' },
                ]
          )
          return html.div(
            attr.class('flex flex-col gap-4 w-full max-w-xs'),
            LocaleSelector({
              locales,
              updateLocale: false,
              onChange: value => console.log('Selected:', value),
            }),
            html.button(
              attr.class(
                'text-sm text-primary-600 dark:text-primary-400 hover:underline cursor-pointer text-left'
              ),
              attr.type('button'),
              html.span(Value.map(showAll, v => (v ? 'Show fewer locales' : 'Show all locales')) as Value<string>),
              on.click(() => showAll.update(v => !v))
            )
          )
        },
        'The locales list is reactive and can be updated dynamically. Use this to lazily load locale options.'
      ),
      Section(
        'In a Settings Card',
        () =>
          Card(
            {},
            html.div(
              attr.class('space-y-4'),
              html.h3(attr.class('text-base font-semibold'), 'Language & Region'),
              html.p(
                attr.class('text-sm text-gray-500'),
                'Choose the language used throughout the interface.'
              ),
              html.div(
                attr.class('w-full max-w-xs'),
                LocaleSelector({
                  locales: prop(commonLocales),
                  updateLocale: false,
                  onChange: value => console.log('Language changed to:', value),
                })
              )
            )
          ),
        'LocaleSelector is commonly placed in a settings panel or toolbar to allow users to switch languages.'
      ),
    ],
  })
}
