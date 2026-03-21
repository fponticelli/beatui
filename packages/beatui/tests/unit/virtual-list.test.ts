import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mock ResizeObserver for jsdom
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.ResizeObserver
}
import { render, prop } from '@tempots/dom'
import { VirtualList } from '../../src/components/data/virtual-scrolling/virtual-list'
import { BeatUI } from '../../src/components/beatui'
import { html, attr, style } from '@tempots/dom'

const ITEM_HEIGHT = 40

function makeItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({ id: i, label: `Item ${i}` }))
}

describe('VirtualList', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders the scroll container with correct class', () => {
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(100),
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          renderItem: (item) => html.div(attr.class('list-item'), item.label),
        })
      ),
      container
    )

    const scrollEl = container.querySelector('.bc-virtual-list')
    expect(scrollEl).not.toBeNull()
  })

  it('renders the spacer with correct total height for fixed-height items', () => {
    const itemCount = 100
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(itemCount),
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          renderItem: (item) => html.div(item.label),
        })
      ),
      container
    )

    const spacer = container.querySelector('.bc-virtual-list__spacer') as HTMLElement
    expect(spacer).not.toBeNull()
    // Total height = 100 items * 40px = 4000px
    expect(spacer.style.height).toBe(`${itemCount * ITEM_HEIGHT}px`)
  })

  it('renders only a subset of items (not all 10000)', () => {
    const totalItems = 10000
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(totalItems),
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          overscan: 5,
          renderItem: (item) =>
            html.div(attr.class('list-item'), item.label),
        })
      ),
      container
    )

    const renderedItems = container.querySelectorAll('.list-item')
    // With containerHeight=400 and itemHeight=40, visible = ceil(400/40) = 10 items
    // Plus 2 * overscan(5) = 10 extra items at most
    // At scroll=0, startIndex=0 capped at 0, so we get ~20 items max
    expect(renderedItems.length).toBeLessThan(totalItems)
    expect(renderedItems.length).toBeGreaterThan(0)
  })

  it('renders items starting from index 0 when scrollTop is 0', () => {
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(1000),
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          overscan: 0,
          renderItem: (item) =>
            html.div(attr.class('list-item'), item.label),
        })
      ),
      container
    )

    // First rendered item should have text "Item 0"
    const listItems = container.querySelectorAll('.list-item')
    expect(listItems.length).toBeGreaterThan(0)
    expect(listItems[0]?.textContent).toBe('Item 0')
  })

  it('renders the viewport div', () => {
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(100),
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          renderItem: (item) => html.div(item.label),
        })
      ),
      container
    )

    const viewport = container.querySelector('.bc-virtual-list__viewport')
    expect(viewport).not.toBeNull()
  })

  it('applies correct container height style as number', () => {
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(100),
          itemHeight: ITEM_HEIGHT,
          containerHeight: 500,
          renderItem: (item) => html.div(item.label),
        })
      ),
      container
    )

    const scrollEl = container.querySelector('.bc-virtual-list') as HTMLElement
    expect(scrollEl.style.height).toBe('500px')
  })

  it('applies correct container height style as CSS string', () => {
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(100),
          itemHeight: ITEM_HEIGHT,
          containerHeight: '100%',
          renderItem: (item) => html.div(item.label),
        })
      ),
      container
    )

    const scrollEl = container.querySelector('.bc-virtual-list') as HTMLElement
    expect(scrollEl.style.height).toBe('100%')
  })

  it('applies additional class names from the class option', () => {
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(50),
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          class: 'my-custom-class',
          renderItem: (item) => html.div(item.label),
        })
      ),
      container
    )

    const scrollEl = container.querySelector('.bc-virtual-list')
    expect(scrollEl?.classList.contains('my-custom-class')).toBe(true)
  })

  it('renders items reactively when items signal changes', async () => {
    const items = prop(makeItems(10))

    render(
      BeatUI(
        {},
        VirtualList({
          items,
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          overscan: 0,
          renderItem: (item) =>
            html.div(attr.class('list-item'), item.label),
        })
      ),
      container
    )

    let rendered = container.querySelectorAll('.list-item')
    expect(rendered.length).toBe(10)

    // Update items signal
    items.set(makeItems(5))
    await new Promise(resolve => setTimeout(resolve, 0))

    rendered = container.querySelectorAll('.list-item')
    expect(rendered.length).toBe(5)
  })

  it('updates spacer height reactively when items signal changes', async () => {
    const items = prop(makeItems(100))

    render(
      BeatUI(
        {},
        VirtualList({
          items,
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          renderItem: (item) => html.div(item.label),
        })
      ),
      container
    )

    let spacer = container.querySelector('.bc-virtual-list__spacer') as HTMLElement
    expect(spacer.style.height).toBe(`${100 * ITEM_HEIGHT}px`)

    items.set(makeItems(50))
    await new Promise(resolve => setTimeout(resolve, 0))

    spacer = container.querySelector('.bc-virtual-list__spacer') as HTMLElement
    expect(spacer.style.height).toBe(`${50 * ITEM_HEIGHT}px`)
  })

  it('scrolling changes the set of visible items', async () => {
    const totalItems = 1000
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(totalItems),
          itemHeight: ITEM_HEIGHT,
          containerHeight: 200,
          overscan: 0,
          renderItem: (item) =>
            html.div(attr.class('list-item'), item.label),
        })
      ),
      container
    )

    const scrollEl = container.querySelector('.bc-virtual-list') as HTMLElement

    // Verify initial render starts at item 0
    let listItems = container.querySelectorAll('.list-item')
    expect(listItems.length).toBeGreaterThan(0)
    expect(listItems[0]?.textContent).toBe('Item 0')

    // Simulate scroll: scrollTop = 2000px (item 50 would be at top with 40px items)
    Object.defineProperty(scrollEl, 'scrollTop', { value: 2000, writable: true })
    Object.defineProperty(scrollEl, 'clientHeight', { value: 200, writable: true })
    scrollEl.dispatchEvent(new Event('scroll'))

    await new Promise(resolve => setTimeout(resolve, 0))

    // After scrolling to 2000px, items around index 50 should be rendered
    listItems = container.querySelectorAll('.list-item')
    expect(listItems.length).toBeGreaterThan(0)
    // First visible item should be around Item 50 (not Item 0)
    expect(listItems[0]?.textContent).not.toBe('Item 0')
    // The rendered items should contain "Item 50"
    const texts = Array.from(listItems).map(el => el.textContent)
    expect(texts.some(t => t === 'Item 50')).toBe(true)
  })

  it('handles variable item heights correctly', () => {
    const itemCount = 100
    // Even items are 60px, odd items are 30px
    const heightFn = (index: number) => (index % 2 === 0 ? 60 : 30)

    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(itemCount),
          itemHeight: heightFn,
          containerHeight: 400,
          overscan: 0,
          renderItem: (item) =>
            html.div(attr.class('list-item'), item.label),
        })
      ),
      container
    )

    // Total height = 50 * 60 + 50 * 30 = 3000 + 1500 = 4500
    const spacer = container.querySelector('.bc-virtual-list__spacer') as HTMLElement
    expect(spacer.style.height).toBe('4500px')

    // Should render some items at scroll=0
    const renderedItems = container.querySelectorAll('.list-item')
    expect(renderedItems.length).toBeGreaterThan(0)
    expect(renderedItems.length).toBeLessThan(itemCount)
  })

  it('handles empty items array without throwing', () => {
    expect(() => {
      render(
        BeatUI(
          {},
          VirtualList({
            items: [],
            itemHeight: ITEM_HEIGHT,
            containerHeight: 400,
            renderItem: (item) => html.div(String(item)),
          })
        ),
        container
      )
    }).not.toThrow()

    const spacer = container.querySelector('.bc-virtual-list__spacer') as HTMLElement
    expect(spacer.style.height).toBe('0px')

    const items = container.querySelectorAll('.list-item')
    expect(items.length).toBe(0)
  })

  it('uses the overscan parameter to render extra items', () => {
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(1000),
          itemHeight: ITEM_HEIGHT,
          containerHeight: 200,
          overscan: 10,
          renderItem: (item) =>
            html.div(attr.class('list-item'), item.label),
        })
      ),
      container
    )

    const renderedItems = container.querySelectorAll('.list-item')
    // visible = ceil(200/40) = 5, + 2 * overscan(10) = 25, but capped at [0, 999]
    // So at scrollTop=0, startIndex = max(0, 0 - 10) = 0, endIndex = ceil(200/40) + 10 = 15
    expect(renderedItems.length).toBeGreaterThanOrEqual(5)
  })

  it('has role="list" for accessibility', () => {
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(10),
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          renderItem: (item) => html.div(item.label),
        })
      ),
      container
    )

    const scrollEl = container.querySelector('.bc-virtual-list')
    expect(scrollEl?.getAttribute('role')).toBe('list')
  })

  it('has aria-label for accessibility', () => {
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(10),
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          renderItem: (item) => html.div(item.label),
        })
      ),
      container
    )

    const scrollEl = container.querySelector('.bc-virtual-list')
    expect(scrollEl?.getAttribute('aria-label')).toBeTruthy()
  })

  it('renders item content correctly', () => {
    render(
      BeatUI(
        {},
        VirtualList({
          items: [{ id: 0, label: 'First Item' }, { id: 1, label: 'Second Item' }],
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          renderItem: (item) =>
            html.div(attr.class('list-item'), item.label),
        })
      ),
      container
    )

    const listItems = container.querySelectorAll('.list-item')
    expect(listItems.length).toBe(2)
    expect(listItems[0]?.textContent).toBe('First Item')
    expect(listItems[1]?.textContent).toBe('Second Item')
  })

  it('passes index correctly to renderItem', () => {
    render(
      BeatUI(
        {},
        VirtualList({
          items: [{ id: 0, label: 'A' }, { id: 1, label: 'B' }, { id: 2, label: 'C' }],
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          renderItem: (item, index) =>
            html.div(attr.class('list-item'), `${index}:${item.label}`),
        })
      ),
      container
    )

    const listItems = container.querySelectorAll('.list-item')
    expect(listItems[0]?.textContent).toBe('0:A')
    expect(listItems[1]?.textContent).toBe('1:B')
    expect(listItems[2]?.textContent).toBe('2:C')
  })

  it('applies style.height to list items for fixed heights', () => {
    render(
      BeatUI(
        {},
        VirtualList({
          items: makeItems(5),
          itemHeight: ITEM_HEIGHT,
          containerHeight: 400,
          renderItem: (item) =>
            html.div(
              attr.class('list-item'),
              style.height(`${ITEM_HEIGHT}px`),
              item.label
            ),
        })
      ),
      container
    )

    const firstItem = container.querySelector('.list-item') as HTMLElement
    expect(firstItem?.style.height).toBe(`${ITEM_HEIGHT}px`)
  })
})
