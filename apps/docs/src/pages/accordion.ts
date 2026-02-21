import {
  Accordion,
  ControlSize,
  ScrollablePanel,
  SegmentedInput,
  Stack,
  InputWrapper,
  Switch,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'

const allSizes: ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

export default function AccordionPage() {
  const size = prop<ControlSize>('md')
  const variant = prop<'default' | 'separated'>('default')
  const multiple = prop(false)

  const items = [
    {
      key: 'getting-started',
      header: 'Getting Started',
      body: html.div(
        html.p(
          'BeatUI is a comprehensive component library built on the Tempo ecosystem. ',
          'It provides reactive UI components with fine-grained reactivity.'
        ),
        html.p(
          attr.class('mt-2'),
          'Install with: ',
          html.code('pnpm add @tempots/beatui')
        )
      ),
    },
    {
      key: 'features',
      header: 'Features',
      body: html.div(
        html.ul(
          attr.class('list-disc pl-4'),
          html.li('Reactive components with fine-grained updates'),
          html.li('Theme-aware with light/dark mode support'),
          html.li('Fully accessible with ARIA attributes'),
          html.li('Customizable via design tokens')
        )
      ),
    },
    {
      key: 'usage',
      header: 'Usage',
      body: html.div(
        html.p(
          'Import components directly from the package and use them in your Tempo application.'
        ),
        html.pre(
          attr.class('mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm'),
          "import { Button } from '@tempots/beatui'\n\nButton({ variant: 'filled' }, 'Click me')"
        )
      ),
    },
    {
      key: 'disabled-item',
      header: 'Disabled Section',
      body: html.p('This content cannot be reached.'),
      disabled: true,
    },
  ]

  return ScrollablePanel({
    header: ControlsHeader(
      InputWrapper({
        label: 'Size',
        content: SegmentedInput({
          options: { xs: 'XS', sm: 'SM', md: 'MD', lg: 'LG', xl: 'XL' },
          value: size,
          onChange: v => size.set(v),
        }),
      }),
      InputWrapper({
        label: 'Variant',
        content: SegmentedInput({
          options: { default: 'Default', separated: 'Separated' },
          value: variant,
          onChange: v => variant.set(v),
        }),
      }),
      InputWrapper({
        label: 'Multiple',
        content: Switch({
          value: multiple,
          onChange: v => multiple.set(v),
        }),
      })
    ),
    body: Stack(
      attr.class('items-start gap-6 p-4'),

      // Basic example
      html.h3(attr.class('text-lg font-semibold'), 'Basic Accordion'),
      html.div(
        attr.class('w-full max-w-xl'),
        Accordion({
          items,
          size,
          variant,
          multiple,
        })
      ),

      // With default open
      html.h3(
        attr.class('text-lg font-semibold mt-4'),
        'With Default Open Item'
      ),
      html.div(
        attr.class('w-full max-w-xl'),
        Accordion({
          items: [
            {
              key: 'open',
              header: 'Open by default',
              body: html.p('This section starts expanded.'),
              defaultOpen: true,
            },
            {
              key: 'closed',
              header: 'Closed by default',
              body: html.p('This section starts collapsed.'),
            },
          ],
          size,
          variant,
        })
      ),

      // Size comparison
      html.h3(attr.class('text-lg font-semibold mt-4'), 'Size Comparison'),
      ...allSizes.map(s =>
        html.div(
          attr.class('w-full max-w-xl mb-4'),
          html.p(
            attr.class('text-sm text-gray-500 dark:text-gray-400 mb-1'),
            `Size: ${s}`
          ),
          Accordion({
            items: [
              {
                key: 'item1',
                header: `Section (${s})`,
                body: html.p(`Content with size ${s}.`),
              },
              {
                key: 'item2',
                header: `Another Section (${s})`,
                body: html.p(`More content with size ${s}.`),
              },
            ],
            size: s,
            variant,
          })
        )
      )
    ),
  })
}
