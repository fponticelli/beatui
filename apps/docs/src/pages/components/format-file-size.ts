import { FormatFileSize } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'FormatFileSize',
  category: 'Formatting',
  component: 'FormatFileSize',
  description:
    'Locale-aware file size formatting component that converts byte counts into human-readable strings like "1.5 MB".',
  order: 10,
}

function DemoRow(label: string, node: ReturnType<typeof FormatFileSize>) {
  return html.div(
    attr.class('flex items-center gap-4'),
    html.span(attr.class('text-sm text-gray-500 w-40 shrink-0'), label),
    html.span(attr.class('font-mono text-sm'), node)
  )
}

export default function FormatFileSizePage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'FormatFileSize',
      props => FormatFileSize(props),
      { defaults: { value: 1536000 } }
    ),
    sections: [
      Section(
        'Common File Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('0 bytes', FormatFileSize({ value: 0, locale: 'en-US' })),
            DemoRow('512 B', FormatFileSize({ value: 512, locale: 'en-US' })),
            DemoRow('1 KB', FormatFileSize({ value: 1024, locale: 'en-US' })),
            DemoRow('1.5 KB (1 dp)', FormatFileSize({ value: 1536, locale: 'en-US', decimalPlaces: 1 })),
            DemoRow('1 MB', FormatFileSize({ value: 1_048_576, locale: 'en-US' })),
            DemoRow('4.2 GB (1 dp)', FormatFileSize({ value: 4_509_715_660, locale: 'en-US', decimalPlaces: 1 })),
            DemoRow('1 TB', FormatFileSize({ value: 1_099_511_627_776, locale: 'en-US' }))
          ),
        'Uses binary prefixes (1 KB = 1024 B). The unit is selected automatically based on magnitude.'
      ),
      Section(
        'Decimal Places',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('0 dp (default)', FormatFileSize({ value: 1_572_864, locale: 'en-US' })),
            DemoRow('1 dp', FormatFileSize({ value: 1_572_864, locale: 'en-US', decimalPlaces: 1 })),
            DemoRow('2 dp', FormatFileSize({ value: 1_572_864, locale: 'en-US', decimalPlaces: 2 })),
            DemoRow('3 dp', FormatFileSize({ value: 1_572_864, locale: 'en-US', decimalPlaces: 3 }))
          ),
        'decimalPlaces controls how many fractional digits appear. The number is formatted with the locale decimal separator.'
      ),
      Section(
        'Locale Number Formatting',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('en-US', FormatFileSize({ value: 1_572_864, locale: 'en-US', decimalPlaces: 2 })),
            DemoRow('de-DE', FormatFileSize({ value: 1_572_864, locale: 'de-DE', decimalPlaces: 2 })),
            DemoRow('fr-FR', FormatFileSize({ value: 1_572_864, locale: 'fr-FR', decimalPlaces: 2 })),
            DemoRow('ja-JP', FormatFileSize({ value: 1_572_864, locale: 'ja-JP', decimalPlaces: 2 }))
          ),
        'The numeric portion of the file size is formatted using Intl.NumberFormat so decimal separators match the locale.'
      ),
      Section(
        'Custom Unit Labels',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow(
              'Bytes/KiB/MiB',
              FormatFileSize({
                value: 1_572_864,
                locale: 'en-US',
                decimalPlaces: 1,
                units: ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'],
              })
            ),
            DemoRow(
              'B/kB/MB (SI)',
              FormatFileSize({
                value: 1_500_000,
                locale: 'en-US',
                decimalPlaces: 1,
                units: ['B', 'kB', 'MB', 'GB', 'TB'],
              })
            )
          ),
        'Provide a units array to override the default labels. This allows IEC binary prefixes (KiB, MiB) or SI decimal prefixes (kB, MB).'
      ),
    ],
  })
}
