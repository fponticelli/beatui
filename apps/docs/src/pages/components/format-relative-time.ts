import { FormatRelativeTime } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'FormatRelativeTime',
  category: 'Formatting',
  component: 'FormatRelativeTime',
  description:
    'Locale-aware relative time formatting component producing expressions like "2 days ago" or "in 3 hours".',
  order: 6,
}

function DemoRow(label: string, node: ReturnType<typeof FormatRelativeTime>) {
  return html.div(
    attr.class('flex items-center gap-4'),
    html.span(attr.class('text-sm text-gray-500 w-44 shrink-0'), label),
    html.span(attr.class('font-mono text-sm'), node)
  )
}

export default function FormatRelativeTimePage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'FormatRelativeTime',
      props => FormatRelativeTime(props),
      { defaults: { value: -2 } }
    ),
    sections: [
      Section(
        'Past and Future',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('-1 year', FormatRelativeTime({ value: -1, unit: 'year', locale: 'en-US' })),
            DemoRow('-3 months', FormatRelativeTime({ value: -3, unit: 'month', locale: 'en-US' })),
            DemoRow('-2 weeks', FormatRelativeTime({ value: -2, unit: 'week', locale: 'en-US' })),
            DemoRow('-5 days', FormatRelativeTime({ value: -5, unit: 'day', locale: 'en-US' })),
            DemoRow('-4 hours', FormatRelativeTime({ value: -4, unit: 'hour', locale: 'en-US' })),
            DemoRow('-30 minutes', FormatRelativeTime({ value: -30, unit: 'minute', locale: 'en-US' })),
            DemoRow('+2 days', FormatRelativeTime({ value: 2, unit: 'day', locale: 'en-US' })),
            DemoRow('+1 month', FormatRelativeTime({ value: 1, unit: 'month', locale: 'en-US' })),
            DemoRow('+6 months', FormatRelativeTime({ value: 6, unit: 'month', locale: 'en-US' }))
          ),
        'Negative values produce "X ago" phrasing and positive values produce "in X" phrasing.'
      ),
      Section(
        'Numeric vs Auto',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            html.p(attr.class('text-sm text-gray-500 mb-1'), 'numeric: "always" (default)'),
            DemoRow('-1 day (always)', FormatRelativeTime({ value: -1, unit: 'day', locale: 'en-US', numeric: 'always' })),
            DemoRow('0 days (always)', FormatRelativeTime({ value: 0, unit: 'day', locale: 'en-US', numeric: 'always' })),
            DemoRow('+1 day (always)', FormatRelativeTime({ value: 1, unit: 'day', locale: 'en-US', numeric: 'always' })),
            html.p(attr.class('text-sm text-gray-500 mt-3 mb-1'), 'numeric: "auto"'),
            DemoRow('-1 day (auto)', FormatRelativeTime({ value: -1, unit: 'day', locale: 'en-US', numeric: 'auto' })),
            DemoRow('0 days (auto)', FormatRelativeTime({ value: 0, unit: 'day', locale: 'en-US', numeric: 'auto' })),
            DemoRow('+1 day (auto)', FormatRelativeTime({ value: 1, unit: 'day', locale: 'en-US', numeric: 'auto' }))
          ),
        'numeric: "auto" uses natural language expressions like "yesterday", "today", "tomorrow" when available.'
      ),
      Section(
        'Style Variants',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('long (default)', FormatRelativeTime({ value: -3, unit: 'day', locale: 'en-US', style: 'long' })),
            DemoRow('short', FormatRelativeTime({ value: -3, unit: 'day', locale: 'en-US', style: 'short' })),
            DemoRow('narrow', FormatRelativeTime({ value: -3, unit: 'day', locale: 'en-US', style: 'narrow' })),
            DemoRow('long (de-DE)', FormatRelativeTime({ value: -3, unit: 'day', locale: 'de-DE', style: 'long' })),
            DemoRow('narrow (ja-JP)', FormatRelativeTime({ value: -3, unit: 'day', locale: 'ja-JP', style: 'narrow' }))
          ),
        'style controls verbosity: long uses full words, short uses abbreviations, narrow is the most compact form.'
      ),
    ],
  })
}
