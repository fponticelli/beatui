import { FormatDate } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'FormatDate',
  category: 'Formatting',
  component: 'FormatDate',
  description:
    'Locale-aware date formatting component with preset styles, fine-grained part selection, and support for Temporal types.',
  order: 3,
}

const DEMO_DATE = new Date('2026-03-17T12:00:00')

function DemoRow(label: string, node: ReturnType<typeof FormatDate>) {
  return html.div(
    attr.class('flex items-center gap-4'),
    html.span(attr.class('text-sm text-gray-500 w-32 shrink-0'), label),
    html.span(attr.class('font-mono text-sm'), node)
  )
}

export default function FormatDatePage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'FormatDate',
      props => FormatDate(props),
      { defaults: { value: DEMO_DATE } }
    ),
    sections: [
      Section(
        'Preset Styles',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('full (en-US)', FormatDate({ value: DEMO_DATE, locale: 'en-US', dateStyle: 'full' })),
            DemoRow('full (de-DE)', FormatDate({ value: DEMO_DATE, locale: 'de-DE', dateStyle: 'full' })),
            DemoRow('full (ja-JP)', FormatDate({ value: DEMO_DATE, locale: 'ja-JP', dateStyle: 'full' })),
            DemoRow('long (fr-FR)', FormatDate({ value: DEMO_DATE, locale: 'fr-FR', dateStyle: 'long' })),
            DemoRow('medium', FormatDate({ value: DEMO_DATE, locale: 'en-US', dateStyle: 'medium' })),
            DemoRow('short', FormatDate({ value: DEMO_DATE, locale: 'en-US', dateStyle: 'short' }))
          ),
        'The dateStyle preset produces locale-appropriate orderings and text. full, long, medium, and short differ in verbosity.'
      ),
      Section(
        'Custom Part Selection',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow(
              'weekday + day',
              FormatDate({
                value: DEMO_DATE,
                locale: 'en-US',
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
            ),
            DemoRow(
              'short weekday',
              FormatDate({
                value: DEMO_DATE,
                locale: 'en-US',
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })
            ),
            DemoRow(
              'year + month',
              FormatDate({
                value: DEMO_DATE,
                locale: 'en-US',
                year: 'numeric',
                month: 'long',
              })
            ),
            DemoRow(
              '2-digit year',
              FormatDate({
                value: DEMO_DATE,
                locale: 'en-US',
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
              })
            )
          ),
        'When any of weekday, year, month, day, or era are set, dateStyle is ignored and parts are assembled individually.'
      ),
      Section(
        'Locales Compared',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('en-US', FormatDate({ value: DEMO_DATE, locale: 'en-US', dateStyle: 'medium' })),
            DemoRow('en-GB', FormatDate({ value: DEMO_DATE, locale: 'en-GB', dateStyle: 'medium' })),
            DemoRow('de-DE', FormatDate({ value: DEMO_DATE, locale: 'de-DE', dateStyle: 'medium' })),
            DemoRow('fr-FR', FormatDate({ value: DEMO_DATE, locale: 'fr-FR', dateStyle: 'medium' })),
            DemoRow('ja-JP', FormatDate({ value: DEMO_DATE, locale: 'ja-JP', dateStyle: 'medium' })),
            DemoRow('zh-CN', FormatDate({ value: DEMO_DATE, locale: 'zh-CN', dateStyle: 'medium' })),
            DemoRow('ar-SA', FormatDate({ value: DEMO_DATE, locale: 'ar-SA', dateStyle: 'medium' }))
          ),
        'The same date displayed in multiple locales showing different ordering conventions, separators, and scripts.'
      ),
      Section(
        'ISO Strings and Timestamps',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow(
              'ISO string',
              FormatDate({ value: '2026-03-17', locale: 'en-US', dateStyle: 'long' })
            ),
            DemoRow(
              'timestamp',
              FormatDate({ value: 1742169600000, locale: 'en-US', dateStyle: 'long' })
            )
          ),
        'FormatDate accepts Date objects, ISO 8601 strings, Unix timestamps in milliseconds, and any Temporal-like object.'
      ),
    ],
  })
}
