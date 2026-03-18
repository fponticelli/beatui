import { FormatPlural } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'FormatPlural',
  category: 'Formatting',
  component: 'FormatPlural',
  description:
    'Locale-aware plural formatting component that selects the correct grammatical form based on CLDR plural rules and interpolates {count}.',
  order: 9,
}

function DemoRow(label: string, node: ReturnType<typeof FormatPlural>) {
  return html.div(
    attr.class('flex items-center gap-4'),
    html.span(attr.class('text-sm text-gray-500 w-24 shrink-0'), label),
    html.span(attr.class('font-mono text-sm'), node)
  )
}

const ITEM_MESSAGES = { one: '{count} item', other: '{count} items' }

export default function FormatPluralPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('FormatPlural', signals => {
      return html.div(
        attr.class('flex flex-col gap-2'),
        DemoRow('en-US', FormatPlural({ ...signals, messages: ITEM_MESSAGES, locale: 'en-US' })),
        DemoRow('de-DE', FormatPlural({ ...signals, messages: ITEM_MESSAGES, locale: 'de-DE' })),
        DemoRow('fr-FR', FormatPlural({ ...signals, messages: ITEM_MESSAGES, locale: 'fr-FR' }))
      )
    }),
    sections: [
      Section(
        'Cardinal Plural',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('0 items', FormatPlural({ value: 0, messages: ITEM_MESSAGES, locale: 'en-US' })),
            DemoRow('1 item', FormatPlural({ value: 1, messages: ITEM_MESSAGES, locale: 'en-US' })),
            DemoRow('2 items', FormatPlural({ value: 2, messages: ITEM_MESSAGES, locale: 'en-US' })),
            DemoRow('1,000 items', FormatPlural({ value: 1000, messages: ITEM_MESSAGES, locale: 'en-US' })),
            DemoRow(
              '1,000 (de-DE)',
              FormatPlural({ value: 1000, messages: ITEM_MESSAGES, locale: 'de-DE' })
            )
          ),
        'The {count} placeholder is replaced with the locale-formatted number. The correct message key is chosen by CLDR plural rules.'
      ),
      Section(
        'Ordinal Plural',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...([1, 2, 3, 4, 5, 11, 12, 13, 21, 22] as const).map((n) =>
              DemoRow(
                `${n}`,
                FormatPlural({
                  value: n,
                  type: 'ordinal',
                  messages: {
                    one: '{count}st',
                    two: '{count}nd',
                    few: '{count}rd',
                    other: '{count}th',
                  },
                  locale: 'en-US',
                })
              )
            )
          ),
        'type: "ordinal" applies ordinal plural rules — 1st, 2nd, 3rd, 4th. English has four ordinal categories: one, two, few, other.'
      ),
      Section(
        'Multi-Language Comparison',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            html.p(attr.class('text-sm text-gray-500 mb-1'), 'count = 1'),
            DemoRow('en-US', FormatPlural({ value: 1, messages: ITEM_MESSAGES, locale: 'en-US' })),
            DemoRow('fr-FR', FormatPlural({ value: 1, messages: ITEM_MESSAGES, locale: 'fr-FR' })),
            DemoRow('de-DE', FormatPlural({ value: 1, messages: ITEM_MESSAGES, locale: 'de-DE' })),
            html.p(attr.class('text-sm text-gray-500 mt-3 mb-1'), 'count = 2'),
            DemoRow('en-US', FormatPlural({ value: 2, messages: ITEM_MESSAGES, locale: 'en-US' })),
            DemoRow('fr-FR', FormatPlural({ value: 2, messages: ITEM_MESSAGES, locale: 'fr-FR' })),
            DemoRow('de-DE', FormatPlural({ value: 2, messages: ITEM_MESSAGES, locale: 'de-DE' }))
          ),
        'Plural rules differ between languages. Arabic has 6 categories; many languages treat 0 and 1 differently than English.'
      ),
    ],
  })
}
