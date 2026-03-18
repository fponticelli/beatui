import { FormatBigInt } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'FormatBigInt',
  category: 'Formatting',
  component: 'FormatBigInt',
  description:
    'Locale-aware bigint formatting component for arbitrarily large integers with decimal, currency, and unit styles.',
  order: 2,
}

function DemoRow(label: string, node: ReturnType<typeof FormatBigInt>) {
  return html.div(
    attr.class('flex items-center gap-4'),
    html.span(attr.class('text-sm text-gray-500 w-48 shrink-0'), label),
    html.span(attr.class('font-mono text-sm'), node)
  )
}

export default function FormatBigIntPage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'FormatBigInt',
      props => FormatBigInt(props)
    ),
    sections: [
      Section(
        'Basic Formatting',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('Small (42n)', FormatBigInt({ value: 42n, locale: 'en-US' })),
            DemoRow(
              'Thousands (1,000,000n)',
              FormatBigInt({ value: 1_000_000n, locale: 'en-US' })
            ),
            DemoRow(
              'Max safe int',
              FormatBigInt({ value: 9007199254740991n, locale: 'en-US' })
            ),
            DemoRow(
              'Beyond max safe int',
              FormatBigInt({ value: 9007199254740993n, locale: 'en-US' })
            ),
            DemoRow(
              'No grouping',
              FormatBigInt({ value: 1_234_567n, locale: 'en-US', useGrouping: false })
            )
          ),
        'FormatBigInt handles arbitrarily large integers beyond Number.MAX_SAFE_INTEGER without precision loss.'
      ),
      Section(
        'Currency',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow(
              'USD',
              FormatBigInt({ value: 123456789n, locale: 'en-US', style: 'currency', currency: 'USD' })
            ),
            DemoRow(
              'EUR (de-DE)',
              FormatBigInt({ value: 123456789n, locale: 'de-DE', style: 'currency', currency: 'EUR' })
            ),
            DemoRow(
              'JPY (ja-JP)',
              FormatBigInt({ value: 123456789n, locale: 'ja-JP', style: 'currency', currency: 'JPY' })
            ),
            DemoRow(
              'USD code',
              FormatBigInt({
                value: 123456789n,
                locale: 'en-US',
                style: 'currency',
                currency: 'USD',
                currencyDisplay: 'code',
              })
            )
          ),
        'Currency formatting works the same as FormatNumber but accepts bigint values for large monetary amounts.'
      ),
      Section(
        'Sign Display',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow(
              'auto (default)',
              FormatBigInt({ value: 42n, locale: 'en-US', signDisplay: 'auto' })
            ),
            DemoRow(
              'always (positive)',
              FormatBigInt({ value: 42n, locale: 'en-US', signDisplay: 'always' })
            ),
            DemoRow(
              'never',
              FormatBigInt({ value: -42n, locale: 'en-US', signDisplay: 'never' })
            ),
            DemoRow(
              'exceptZero (0)',
              FormatBigInt({ value: 0n, locale: 'en-US', signDisplay: 'exceptZero' })
            )
          ),
        'signDisplay controls when the sign character is shown. "always" forces a + prefix on positive values.'
      ),
    ],
  })
}
