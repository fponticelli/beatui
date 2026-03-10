import { describe, it, expect } from 'vitest'
import { render, prop, html, type Value } from '@tempots/dom'
import { Breadcrumbs, type BreadcrumbItem } from '../../src/components/navigation/breadcrumbs'
import type { ControlSize } from '../../src/components/theme/types'
import { WithProviders } from '../helpers/test-providers'

describe('Breadcrumbs Component', () => {
  const sampleItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Breadcrumbs', current: true },
  ]

  it('should render with static items (no maxItems)', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() => Breadcrumbs({ items: sampleItems })),
      container
    )

    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
    const items = container.querySelectorAll('.bc-breadcrumbs__item')
    expect(items.length).toBe(3)
  })

  it('should render with signal items', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const items = prop(sampleItems)
    render(
      WithProviders(() => Breadcrumbs({ items })),
      container
    )

    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
  })

  it('should render with maxItems', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() =>
        Breadcrumbs({
          items: [
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Electronics', href: '/products/electronics' },
            { label: 'Computers', href: '/products/electronics/computers' },
            { label: 'Laptop', current: true },
          ],
          maxItems: 3,
        })
      ),
      container
    )

    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
  })

  it('should render with all playground-like options (signal values)', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const items = prop(sampleItems)
    const size = prop<ControlSize>('md')
    const separator = prop('›')
    const maxItems = prop<number>(0)

    render(
      WithProviders(() =>
        Breadcrumbs({
          items,
          size,
          separator,
          maxItems,
        })
      ),
      container
    )

    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
  })

  it('should handle string value for maxItems (playground default parse bug)', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const items = prop(sampleItems)
    const maxItems = prop('undefined (show all items)') as unknown as Value<number>

    render(
      WithProviders(() =>
        Breadcrumbs({
          items,
          maxItems,
        })
      ),
      container
    )

    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
  })

  it('should render multiple breadcrumbs instances on same page', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() =>
        html.div(
          Breadcrumbs({
            items: prop(sampleItems),
            size: prop<ControlSize>('md'),
            separator: prop('›'),
            maxItems: prop('undefined (show all items)') as unknown as Value<number>,
          }),
          ...(['sm', 'md', 'lg'] as const).map(size =>
            Breadcrumbs({ items: sampleItems, size })
          ),
          Breadcrumbs({ items: sampleItems, separator: '>' }),
          Breadcrumbs({
            items: [
              { label: 'Home', href: '/', icon: 'lucide:home' },
              { label: 'Components', href: '/components', icon: 'lucide:box' },
              { label: 'Breadcrumbs', icon: 'lucide:chevrons-right', current: true },
            ],
          }),
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
          Breadcrumbs({
            items: [
              { label: 'Home', onClick: () => {} },
              { label: 'Settings', onClick: () => {} },
              { label: 'Profile', current: true },
            ],
          }),
        )
      ),
      container
    )

    const navs = container.querySelectorAll('nav')
    expect(navs.length).toBe(8)
  })

  it('should render with icons', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() =>
        Breadcrumbs({
          items: [
            { label: 'Home', href: '/', icon: 'lucide:home' },
            { label: 'Components', href: '/components', icon: 'lucide:box' },
            { label: 'Breadcrumbs', icon: 'lucide:chevrons-right', current: true },
          ],
        })
      ),
      container
    )

    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
  })

  it('should render with click handlers', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(
      WithProviders(() =>
        Breadcrumbs({
          items: [
            { label: 'Home', onClick: () => {} },
            { label: 'Settings', onClick: () => {} },
            { label: 'Profile', current: true },
          ],
        })
      ),
      container
    )

    const nav = container.querySelector('nav')
    expect(nav).not.toBeNull()
  })
})
