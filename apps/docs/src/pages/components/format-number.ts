import { FormatNumber } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'FormatNumber',
  category: 'Formatting',
  component: 'FormatNumber',
  description:
    'Locale-aware number formatting component supporting decimal, currency, percent, unit, and compact notation styles.',
  order: 1,
}

function DemoRow(label: string, ...children: ReturnType<typeof FormatNumber>[]) {
  return html.div(
    attr.class('flex items-center gap-4'),
    html.span(attr.class('text-sm text-gray-500 w-36 shrink-0'), label),
    html.div(attr.class('flex flex-wrap gap-4 font-mono text-sm'), ...children)
  )
}

export default function FormatNumberPage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'FormatNumber',
      props => FormatNumber(props),
      { defaults: { value: 1234567.89 } }
    ),
    sections: [
      Section(
        'Currency',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow(
              'USD (en-US)',
              FormatNumber({ value: 9999.99, locale: 'en-US', style: 'currency', currency: 'USD' })
            ),
            DemoRow(
              'EUR (de-DE)',
              FormatNumber({ value: 9999.99, locale: 'de-DE', style: 'currency', currency: 'EUR' })
            ),
            DemoRow(
              'JPY (ja-JP)',
              FormatNumber({ value: 9999.99, locale: 'ja-JP', style: 'currency', currency: 'JPY' })
            ),
            DemoRow(
              'GBP symbol',
              FormatNumber({ value: 9999.99, locale: 'en-GB', style: 'currency', currency: 'GBP' })
            ),
            DemoRow(
              'USD code',
              FormatNumber({
                value: 9999.99,
                locale: 'en-US',
                style: 'currency',
                currency: 'USD',
                currencyDisplay: 'code',
              })
            ),
            DemoRow(
              'USD name',
              FormatNumber({
                value: 9999.99,
                locale: 'en-US',
                style: 'currency',
                currency: 'USD',
                currencyDisplay: 'name',
              })
            )
          ),
        'Use style: "currency" with a currency code. currencyDisplay controls the symbol, code, or name display.'
      ),
      Section(
        'Percent',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('0.85 (en-US)', FormatNumber({ value: 0.85, locale: 'en-US', style: 'percent' })),
            DemoRow('0.85 (de-DE)', FormatNumber({ value: 0.85, locale: 'de-DE', style: 'percent' })),
            DemoRow(
              '2 decimal places',
              FormatNumber({
                value: 0.8534,
                locale: 'en-US',
                style: 'percent',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            )
          ),
        'style: "percent" multiplies the value by 100 and appends the locale percent sign.'
      ),
      Section(
        'Unit',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow(
              'kilometer (short)',
              FormatNumber({ value: 42.5, locale: 'en-US', style: 'unit', unit: 'kilometer' })
            ),
            DemoRow(
              'kilometer (long)',
              FormatNumber({
                value: 42.5,
                locale: 'en-US',
                style: 'unit',
                unit: 'kilometer',
                unitDisplay: 'long',
              })
            ),
            DemoRow(
              'liter (narrow)',
              FormatNumber({
                value: 3.5,
                locale: 'en-US',
                style: 'unit',
                unit: 'liter',
                unitDisplay: 'narrow',
              })
            ),
            DemoRow(
              'degree (de-DE)',
              FormatNumber({
                value: 36.6,
                locale: 'de-DE',
                style: 'unit',
                unit: 'celsius',
                unitDisplay: 'short',
              })
            )
          ),
        'style: "unit" formats a number with a physical unit. unitDisplay controls short, long, or narrow forms.'
      ),
      Section(
        'Compact Notation',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow(
              '1,200 compact',
              FormatNumber({ value: 1200, locale: 'en-US', notation: 'compact' })
            ),
            DemoRow(
              '1.2M short',
              FormatNumber({
                value: 1_200_000,
                locale: 'en-US',
                notation: 'compact',
                compactDisplay: 'short',
              })
            ),
            DemoRow(
              '1.2M long',
              FormatNumber({
                value: 1_200_000,
                locale: 'en-US',
                notation: 'compact',
                compactDisplay: 'long',
              })
            ),
            DemoRow(
              'de-DE compact',
              FormatNumber({ value: 1_200_000, locale: 'de-DE', notation: 'compact' })
            )
          ),
        'notation: "compact" abbreviates large numbers using locale-appropriate short forms like K, M, B.'
      ),
    ],
  })
}
