import { FormatList } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'FormatList',
  category: 'Formatting',
  component: 'FormatList',
  description:
    'Locale-aware list formatting component that joins arrays into natural language strings with conjunction, disjunction, or unit semantics.',
  order: 7,
}

function DemoRow(label: string, node: ReturnType<typeof FormatList>) {
  return html.div(
    attr.class('flex items-center gap-4'),
    html.span(attr.class('text-sm text-gray-500 w-44 shrink-0'), label),
    html.span(attr.class('font-mono text-sm'), node)
  )
}

const FRUITS = ['Apples', 'Oranges', 'Bananas']
const TWO_ITEMS = ['Alice', 'Bob']
const ONE_ITEM = ['Solo']

export default function FormatListPage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'FormatList',
      props => FormatList(props),
      { defaults: { value: ['Apple', 'Banana', 'Cherry'] } }
    ),
    sections: [
      Section(
        'Conjunction',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('3 items (en-US)', FormatList({ value: FRUITS, locale: 'en-US', type: 'conjunction' })),
            DemoRow('2 items (en-US)', FormatList({ value: TWO_ITEMS, locale: 'en-US', type: 'conjunction' })),
            DemoRow('1 item (en-US)', FormatList({ value: ONE_ITEM, locale: 'en-US', type: 'conjunction' })),
            DemoRow('3 items (de-DE)', FormatList({ value: FRUITS, locale: 'de-DE', type: 'conjunction' })),
            DemoRow('3 items (zh-CN)', FormatList({ value: FRUITS, locale: 'zh-CN', type: 'conjunction' }))
          ),
        'type: "conjunction" uses "and" semantics — "A, B, and C" in English. The exact phrasing varies by locale.'
      ),
      Section(
        'Disjunction',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('3 items (en-US)', FormatList({ value: FRUITS, locale: 'en-US', type: 'disjunction' })),
            DemoRow('2 items (en-US)', FormatList({ value: TWO_ITEMS, locale: 'en-US', type: 'disjunction' })),
            DemoRow('3 items (de-DE)', FormatList({ value: FRUITS, locale: 'de-DE', type: 'disjunction' })),
            DemoRow('3 items (fr-FR)', FormatList({ value: FRUITS, locale: 'fr-FR', type: 'disjunction' }))
          ),
        'type: "disjunction" uses "or" semantics — "A, B, or C" in English.'
      ),
      Section(
        'Style Variants',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            DemoRow('long (default)', FormatList({ value: FRUITS, locale: 'en-US', style: 'long' })),
            DemoRow('short', FormatList({ value: FRUITS, locale: 'en-US', style: 'short' })),
            DemoRow('narrow', FormatList({ value: FRUITS, locale: 'en-US', style: 'narrow' })),
            DemoRow('unit narrow', FormatList({ value: ['3 km', '200 m'], locale: 'en-US', type: 'unit', style: 'narrow' })),
            DemoRow('unit short', FormatList({ value: ['3 km', '200 m'], locale: 'en-US', type: 'unit', style: 'short' }))
          ),
        'style controls verbosity. type: "unit" is designed for combining units of measurement without a conjunction word.'
      ),
    ],
  })
}
