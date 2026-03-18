import { FormatDateTime } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'FormatDateTime',
  category: 'Formatting',
  component: 'FormatDateTime',
  description:
    'Locale-aware combined date and time formatting component with independent dateStyle and timeStyle controls.',
  order: 5,
}

const DEMO_DATE = new Date('2026-03-17T14:30:45')

function DemoRow(label: string, node: ReturnType<typeof FormatDateTime>) {
  return html.div(
    attr.class('flex items-center gap-4'),
    html.span(attr.class('text-sm text-gray-500 w-44 shrink-0'), label),
    html.span(attr.class('font-mono text-sm'), node)
  )
}

export default function FormatDateTimePage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'FormatDateTime',
      props => FormatDateTime(props),
      { defaults: { value: DEMO_DATE } }
    ),
    sections: [
      Section(
        'Style Combinations',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow(
              'full + full',
              FormatDateTime({ value: DEMO_DATE, locale: 'en-US', dateStyle: 'full', timeStyle: 'full' })
            ),
            DemoRow(
              'long + long',
              FormatDateTime({ value: DEMO_DATE, locale: 'en-US', dateStyle: 'long', timeStyle: 'long' })
            ),
            DemoRow(
              'medium + medium',
              FormatDateTime({ value: DEMO_DATE, locale: 'en-US', dateStyle: 'medium', timeStyle: 'medium' })
            ),
            DemoRow(
              'short + short',
              FormatDateTime({ value: DEMO_DATE, locale: 'en-US', dateStyle: 'short', timeStyle: 'short' })
            ),
            DemoRow(
              'long + short',
              FormatDateTime({ value: DEMO_DATE, locale: 'en-US', dateStyle: 'long', timeStyle: 'short' })
            )
          ),
        'dateStyle and timeStyle can be mixed independently. long date with short time is a common UI pattern.'
      ),
      Section(
        'Locale Comparison',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('en-US', FormatDateTime({ value: DEMO_DATE, locale: 'en-US' })),
            DemoRow('en-GB', FormatDateTime({ value: DEMO_DATE, locale: 'en-GB' })),
            DemoRow('de-DE', FormatDateTime({ value: DEMO_DATE, locale: 'de-DE' })),
            DemoRow('fr-FR', FormatDateTime({ value: DEMO_DATE, locale: 'fr-FR' })),
            DemoRow('ja-JP', FormatDateTime({ value: DEMO_DATE, locale: 'ja-JP' })),
            DemoRow('zh-CN', FormatDateTime({ value: DEMO_DATE, locale: 'zh-CN' }))
          ),
        'The same timestamp rendered with the default medium/short styles across multiple locales.'
      ),
      Section(
        '12/24-Hour Override',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow(
              '12-hour',
              FormatDateTime({ value: DEMO_DATE, locale: 'en-US', hour12: true })
            ),
            DemoRow(
              '24-hour',
              FormatDateTime({ value: DEMO_DATE, locale: 'en-US', hour12: false })
            )
          ),
        'The hour12 option forces 12 or 24-hour time regardless of locale default.'
      ),
    ],
  })
}
