import { FormatTime } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'FormatTime',
  category: 'Formatting',
  component: 'FormatTime',
  description:
    'Locale-aware time formatting component with preset styles, 12/24-hour control, and timezone support.',
  order: 4,
}

const DEMO_DATE = new Date('2026-03-17T14:30:45')

function DemoRow(label: string, node: ReturnType<typeof FormatTime>) {
  return html.div(
    attr.class('flex items-center gap-4'),
    html.span(attr.class('text-sm text-gray-500 w-36 shrink-0'), label),
    html.span(attr.class('font-mono text-sm'), node)
  )
}

export default function FormatTimePage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'FormatTime',
      props => FormatTime(props),
      { defaults: { value: DEMO_DATE } }
    ),
    sections: [
      Section(
        'Preset Styles',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('full', FormatTime({ value: DEMO_DATE, locale: 'en-US', timeStyle: 'full' })),
            DemoRow('long', FormatTime({ value: DEMO_DATE, locale: 'en-US', timeStyle: 'long' })),
            DemoRow('medium', FormatTime({ value: DEMO_DATE, locale: 'en-US', timeStyle: 'medium' })),
            DemoRow('short', FormatTime({ value: DEMO_DATE, locale: 'en-US', timeStyle: 'short' }))
          ),
        'timeStyle presets control the level of detail: full includes timezone name, short is just hours and minutes.'
      ),
      Section(
        '12-Hour vs 24-Hour',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('12-hour (en-US)', FormatTime({ value: DEMO_DATE, locale: 'en-US', hour12: true, timeStyle: 'short' })),
            DemoRow('24-hour (en-US)', FormatTime({ value: DEMO_DATE, locale: 'en-US', hour12: false, timeStyle: 'short' })),
            DemoRow('de-DE (locale default)', FormatTime({ value: DEMO_DATE, locale: 'de-DE', timeStyle: 'short' })),
            DemoRow('en-GB (locale default)', FormatTime({ value: DEMO_DATE, locale: 'en-GB', timeStyle: 'short' }))
          ),
        'Use hour12 to force 12 or 24-hour display regardless of locale default. Omit it to use the locale convention.'
      ),
      Section(
        'Custom Parts',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow(
              'h:mm only',
              FormatTime({
                value: DEMO_DATE,
                locale: 'en-US',
                hour: 'numeric',
                minute: '2-digit',
              })
            ),
            DemoRow(
              'h:mm:ss',
              FormatTime({
                value: DEMO_DATE,
                locale: 'en-US',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
              })
            ),
            DemoRow(
              'with timezone',
              FormatTime({
                value: DEMO_DATE,
                locale: 'en-US',
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short',
              })
            )
          ),
        'When any of hour, minute, second, or timeZoneName are set, timeStyle is ignored and parts are composed individually.'
      ),
    ],
  })
}
