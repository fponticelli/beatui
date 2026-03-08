import { Tabs } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Tabs',
  category: 'Navigation',
  component: 'Tabs',
  description: 'Tabbed navigation for switching between content panels.',
  icon: 'lucide:panel-top-dashed',
  order: 2,
}

const sampleItems = [
  {
    key: 'overview' as const,
    label: 'Overview',
    content: () =>
      html.p(
        attr.class('p-4 text-gray-600 dark:text-gray-400'),
        'This is the overview tab content.'
      ),
  },
  {
    key: 'features' as const,
    label: 'Features',
    content: () =>
      html.p(
        attr.class('p-4 text-gray-600 dark:text-gray-400'),
        'Here are the key features listed out.'
      ),
  },
  {
    key: 'pricing' as const,
    label: 'Pricing',
    content: () =>
      html.p(
        attr.class('p-4 text-gray-600 dark:text-gray-400'),
        'View our pricing plans and options.'
      ),
  },
]

export default function TabsPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Tabs', signals => {
      const value = prop<string>('overview')
      return html.div(
        attr.class('w-full'),
        Tabs({
          ...signals,
          items: sampleItems,
          value,
          onChange: (v: string) => value.set(v),
        } as never)
      )
    }),
    sections: [
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-col gap-8 w-full'),
            ...(
              [
                'default',
                'filled',
                'outline',
                'underline',
                'pill',
              ] as const
            ).map(variant => {
              const active = prop<string>('overview')
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-2'),
                  variant
                ),
                Tabs({
                  items: sampleItems,
                  value: active,
                  onChange: (v: string) => active.set(v),
                  variant,
                  showContent: false,
                })
              )
            })
          ),
        'Tabs support multiple visual variants.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-6 w-full'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => {
              const active = prop<string>('overview')
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-2'),
                  size
                ),
                Tabs({
                  items: sampleItems,
                  value: active,
                  onChange: (v: string) => active.set(v),
                  size,
                  showContent: false,
                })
              )
            })
          ),
        'Available size options.'
      ),
      Section(
        'Vertical',
        () => {
          const active = prop<string>('overview')
          return Tabs({
            items: sampleItems,
            value: active,
            onChange: (v: string) => active.set(v),
            orientation: 'vertical',
          })
        },
        'Tabs can be oriented vertically for sidebar-style navigation.'
      ),
      Section(
        'With Disabled Tab',
        () => {
          const active = prop<string>('overview')
          return Tabs({
            items: [
              ...sampleItems.slice(0, 2),
              {
                key: 'pricing' as const,
                label: 'Pricing',
                content: () => html.p('Pricing content'),
                disabled: true,
              },
            ],
            value: active,
            onChange: (v: string) => active.set(v),
          })
        },
        'Individual tabs can be disabled.'
      ),
    ],
  })
}
