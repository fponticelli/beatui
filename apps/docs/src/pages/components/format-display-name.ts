import { FormatDisplayName } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'FormatDisplayName',
  category: 'Formatting',
  component: 'FormatDisplayName',
  description:
    'Locale-aware display name component for translating language, region, currency, script, and calendar codes into human-readable names.',
  order: 8,
}

function DemoRow(label: string, node: ReturnType<typeof FormatDisplayName>) {
  return html.div(
    attr.class('flex items-center gap-4'),
    html.span(attr.class('text-sm text-gray-500 w-32 shrink-0'), label),
    html.span(attr.class('font-mono text-sm'), node)
  )
}

export default function FormatDisplayNamePage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'FormatDisplayName',
      props => FormatDisplayName(props)
    ),
    sections: [
      Section(
        'Languages',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('en', FormatDisplayName({ value: 'en', type: 'language', locale: 'en' })),
            DemoRow('fr', FormatDisplayName({ value: 'fr', type: 'language', locale: 'en' })),
            DemoRow('de', FormatDisplayName({ value: 'de', type: 'language', locale: 'en' })),
            DemoRow('ja', FormatDisplayName({ value: 'ja', type: 'language', locale: 'en' })),
            DemoRow('zh-Hans', FormatDisplayName({ value: 'zh-Hans', type: 'language', locale: 'en' })),
            DemoRow('ar', FormatDisplayName({ value: 'ar', type: 'language', locale: 'en' })),
            DemoRow('en-US (dialect)', FormatDisplayName({ value: 'en-US', type: 'language', locale: 'en', languageDisplay: 'dialect' })),
            DemoRow('en-US (standard)', FormatDisplayName({ value: 'en-US', type: 'language', locale: 'en', languageDisplay: 'standard' }))
          ),
        'type: "language" resolves BCP 47 language tags. languageDisplay: "dialect" shows regional variants like "American English".'
      ),
      Section(
        'Regions',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('US', FormatDisplayName({ value: 'US', type: 'region', locale: 'en' })),
            DemoRow('DE', FormatDisplayName({ value: 'DE', type: 'region', locale: 'en' })),
            DemoRow('JP', FormatDisplayName({ value: 'JP', type: 'region', locale: 'en' })),
            DemoRow('FR', FormatDisplayName({ value: 'FR', type: 'region', locale: 'en' })),
            DemoRow('US in German', FormatDisplayName({ value: 'US', type: 'region', locale: 'de' })),
            DemoRow('US in French', FormatDisplayName({ value: 'US', type: 'region', locale: 'fr' })),
            DemoRow('US in Japanese', FormatDisplayName({ value: 'US', type: 'region', locale: 'ja' }))
          ),
        'type: "region" resolves ISO 3166-1 alpha-2 country codes. The display language is controlled by the locale option.'
      ),
      Section(
        'Currencies and Scripts',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            html.p(attr.class('text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'), 'Currencies (type: "currency")'),
            DemoRow('USD', FormatDisplayName({ value: 'USD', type: 'currency', locale: 'en' })),
            DemoRow('EUR', FormatDisplayName({ value: 'EUR', type: 'currency', locale: 'en' })),
            DemoRow('JPY', FormatDisplayName({ value: 'JPY', type: 'currency', locale: 'en' })),
            DemoRow('EUR in German', FormatDisplayName({ value: 'EUR', type: 'currency', locale: 'de' })),
            html.p(attr.class('text-sm font-medium text-gray-600 dark:text-gray-400 mt-3 mb-1'), 'Scripts (type: "script")'),
            DemoRow('Latn', FormatDisplayName({ value: 'Latn', type: 'script', locale: 'en' })),
            DemoRow('Hans', FormatDisplayName({ value: 'Hans', type: 'script', locale: 'en' })),
            DemoRow('Arab', FormatDisplayName({ value: 'Arab', type: 'script', locale: 'en' }))
          ),
        'type: "currency" uses ISO 4217 codes. type: "script" uses ISO 15924 script codes like Latn, Cyrl, Hans.'
      ),
    ],
  })
}
