import { Breadcrumbs, Icon } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Breadcrumbs',
  category: 'Navigation',
  component: 'Breadcrumbs',
  description:
    'Hierarchical navigation trail showing the current page location within a site structure.',
  icon: 'lucide:chevrons-right',
  order: 3,
}

const sampleItems = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/components' },
  { label: 'Breadcrumbs', current: true },
]

export default function BreadcrumbsPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Breadcrumbs', signals => {
      const items = prop(sampleItems)
      return Breadcrumbs({
        ...signals,
        items,
      } as never)
    }),
    sections: [
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            ...(['sm', 'md', 'lg'] as const).map(size =>
              html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  size
                ),
                Breadcrumbs({ items: sampleItems, size })
              )
            )
          ),
        'Breadcrumbs support sm, md, and lg sizes.'
      ),
      Section(
        'Custom Separator',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            Breadcrumbs({ items: sampleItems, separator: '>' }),
            Breadcrumbs({ items: sampleItems, separator: '|' }),
            Breadcrumbs({ items: sampleItems, separator: '•' })
          ),
        'The separator between items can be any character or string.'
      ),
      Section(
        'With Icons',
        () =>
          Breadcrumbs({
            items: [
              { label: 'Home', href: '/', icon: 'lucide:home' },
              { label: 'Components', href: '/components', icon: 'lucide:box' },
              {
                label: 'Breadcrumbs',
                icon: 'lucide:chevrons-right',
                current: true,
              },
            ],
          }),
        'Each breadcrumb item can include an optional icon.'
      ),
      Section(
        'Collapsed (maxItems)',
        () =>
          Breadcrumbs({
            items: [
              { label: 'Home', href: '/' },
              { label: 'Products', href: '/products' },
              { label: 'Electronics', href: '/products/electronics' },
              { label: 'Computers', href: '/products/electronics/computers' },
              { label: 'Laptop', current: true },
            ],
            maxItems: 3,
          }),
        'Long breadcrumb trails can be collapsed with maxItems — middle items are replaced by an ellipsis.'
      ),
      Section(
        'With Click Handlers',
        () =>
          Breadcrumbs({
            items: [
              { label: 'Home', onClick: () => console.log('navigate: home') },
              {
                label: 'Settings',
                onClick: () => console.log('navigate: settings'),
              },
              { label: 'Profile', current: true },
            ],
          }),
        'Items can use onClick callbacks instead of href links for programmatic navigation.'
      ),
    ],
  })
}
