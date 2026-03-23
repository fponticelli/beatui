import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop, html, attr } from '@tempots/dom'
import { SortableList } from '../../src/components/form/input/sortable-list'
import { BeatUI } from '../../src/components/beatui'

describe('SortableList', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render items', () => {
    const items = prop(['Apple', 'Banana', 'Cherry'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: v => items.set(v),
          renderItem: (item, handle) =>
            html.div(attr.class('item'), handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    expect(container.querySelector('.bc-sortable-list')).not.toBeNull()

    const listItems = container.querySelectorAll('.bc-sortable-list__item')
    expect(listItems.length).toBe(3)
  })

  it('should render drag handles', () => {
    const items = prop(['A', 'B'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: v => items.set(v),
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const handles = container.querySelectorAll('.bc-sortable-list__handle')
    expect(handles.length).toBe(2)
  })

  it('should have role="list"', () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const list = container.querySelector('.bc-sortable-list')
    expect(list?.getAttribute('role')).toBe('list')
  })

  it('should have role="listitem" on each item', () => {
    const items = prop(['A', 'B'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const listItems = container.querySelectorAll('.bc-sortable-list__item')
    listItems.forEach(item => {
      expect(item.getAttribute('role')).toBe('listitem')
    })
  })

  it('should not be draggable by default', () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const item = container.querySelector('.bc-sortable-list__item')
    expect(item?.hasAttribute('draggable')).toBe(false)
  })

  it('should become draggable after handle mousedown', async () => {
    const items = prop(['A', 'B'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const handle = container.querySelector('.bc-sortable-list__handle')!
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

    await vi.waitFor(() => {
      const firstItem = container.querySelectorAll('.bc-sortable-list__item')[0]
      expect(firstItem?.getAttribute('draggable')).toBe('true')
    })

    // Second item should remain non-draggable
    const secondItem = container.querySelectorAll('.bc-sortable-list__item')[1]
    expect(secondItem?.hasAttribute('draggable')).toBe(false)
  })

  it('should clear draggable on mouseup', async () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const handle = container.querySelector('.bc-sortable-list__handle')!
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

    await vi.waitFor(() => {
      const item = container.querySelector('.bc-sortable-list__item')!
      expect(item.getAttribute('draggable')).toBe('true')
    })

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    await vi.waitFor(() => {
      const item = container.querySelector('.bc-sortable-list__item')!
      expect(item.hasAttribute('draggable')).toBe(false)
    })
  })

  it('should not set draggable when disabled', () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
          disabled: true,
        })
      ),
      container
    )

    const handle = container.querySelector('.bc-sortable-list__handle')!
    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

    const item = container.querySelector('.bc-sortable-list__item')
    expect(item?.hasAttribute('draggable')).toBe(false)
  })

  it('should apply disabled class', () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
          disabled: true,
        })
      ),
      container
    )

    const list = container.querySelector('.bc-sortable-list')
    expect(list?.classList.contains('bc-sortable-list--disabled')).toBe(true)
  })

  it('should apply size class', () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
          size: 'lg',
        })
      ),
      container
    )

    const list = container.querySelector('.bc-sortable-list')
    expect(list?.classList.contains('bc-sortable-list--size-lg')).toBe(true)
  })

  it('should update when items change', async () => {
    const items = prop(['A', 'B'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: v => items.set(v),
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    expect(container.querySelectorAll('.bc-sortable-list__item').length).toBe(2)

    items.set(['A', 'B', 'C'])
    await vi.waitFor(() => {
      expect(container.querySelectorAll('.bc-sortable-list__item').length).toBe(
        3
      )
    })
  })

  it('should have tabindex=0 on items', () => {
    const items = prop(['A', 'B'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const listItems = container.querySelectorAll('.bc-sortable-list__item')
    listItems.forEach(item => {
      expect(item.getAttribute('tabindex')).toBe('0')
    })
  })

  it('should have tabindex=-1 when disabled', () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
          disabled: true,
        })
      ),
      container
    )

    const item = container.querySelector('.bc-sortable-list__item')
    expect(item?.getAttribute('tabindex')).toBe('-1')
  })

  it('should reorder on drop', () => {
    const items = prop(['A', 'B', 'C'])
    const onChange = vi.fn()

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange,
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const listItems = container.querySelectorAll('.bc-sortable-list__item')

    // Simulate drag from index 0 (jsdom lacks DragEvent, use Event)
    const dragstart = new Event('dragstart', { bubbles: true })
    Object.assign(dragstart, {
      dataTransfer: { effectAllowed: '', setData: vi.fn() },
    })
    listItems[0].dispatchEvent(dragstart)

    // Simulate drop on index 2
    const drop = new Event('drop', { bubbles: true, cancelable: true })
    Object.assign(drop, {
      dataTransfer: { dropEffect: '' },
    })
    listItems[2].dispatchEvent(drop)

    expect(onChange).toHaveBeenCalledWith(['B', 'C', 'A'])
  })

  it('should not reorder when dropping on same position', () => {
    const items = prop(['A', 'B'])
    const onChange = vi.fn()

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange,
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const listItems = container.querySelectorAll('.bc-sortable-list__item')

    const dragstart = new Event('dragstart', { bubbles: true })
    Object.assign(dragstart, {
      dataTransfer: { effectAllowed: '', setData: vi.fn() },
    })
    listItems[0].dispatchEvent(dragstart)

    const drop = new Event('drop', { bubbles: true, cancelable: true })
    Object.assign(drop, {
      dataTransfer: { dropEffect: '' },
    })
    listItems[0].dispatchEvent(drop)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should reorder with Alt+ArrowDown', async () => {
    const items = prop(['A', 'B', 'C'])
    const onChange = vi.fn()

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange,
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const firstItem = container.querySelectorAll(
      '.bc-sortable-list__item'
    )[0] as HTMLElement

    firstItem.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        altKey: true,
        bubbles: true,
        cancelable: true,
      })
    )

    expect(onChange).toHaveBeenCalledWith(['B', 'A', 'C'])
  })

  it('should reorder with Alt+ArrowUp', async () => {
    const items = prop(['A', 'B', 'C'])
    const onChange = vi.fn()

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange,
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const lastItem = container.querySelectorAll(
      '.bc-sortable-list__item'
    )[2] as HTMLElement

    lastItem.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        altKey: true,
        bubbles: true,
        cancelable: true,
      })
    )

    expect(onChange).toHaveBeenCalledWith(['A', 'C', 'B'])
  })

  it('should not reorder with Alt+ArrowUp on first item', () => {
    const items = prop(['A', 'B'])
    const onChange = vi.fn()

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange,
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const firstItem = container.querySelectorAll(
      '.bc-sortable-list__item'
    )[0] as HTMLElement

    firstItem.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        altKey: true,
        bubbles: true,
        cancelable: true,
      })
    )

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should not reorder with Alt+ArrowDown on last item', () => {
    const items = prop(['A', 'B'])
    const onChange = vi.fn()

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange,
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const lastItem = container.querySelectorAll(
      '.bc-sortable-list__item'
    )[1] as HTMLElement

    lastItem.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        altKey: true,
        bubbles: true,
        cancelable: true,
      })
    )

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should not reorder via keyboard when disabled', () => {
    const items = prop(['A', 'B'])
    const onChange = vi.fn()

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange,
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
          disabled: true,
        })
      ),
      container
    )

    const firstItem = container.querySelectorAll(
      '.bc-sortable-list__item'
    )[0] as HTMLElement

    firstItem.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        altKey: true,
        bubbles: true,
        cancelable: true,
      })
    )

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should apply variant class', () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
          variant: 'card',
        })
      ),
      container
    )

    const list = container.querySelector('.bc-sortable-list')
    expect(
      list?.classList.contains('bc-sortable-list--variant-card')
    ).toBe(true)
  })

  it('should default to bordered variant', () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const list = container.querySelector('.bc-sortable-list')
    expect(
      list?.classList.contains('bc-sortable-list--variant-bordered')
    ).toBe(true)
  })

  it('should apply plain variant class', () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
          variant: 'plain',
        })
      ),
      container
    )

    const list = container.querySelector('.bc-sortable-list')
    expect(
      list?.classList.contains('bc-sortable-list--variant-plain')
    ).toBe(true)
  })

  it('should apply gap class', () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
          gap: 'lg',
        })
      ),
      container
    )

    const list = container.querySelector('.bc-sortable-list')
    expect(list?.classList.contains('bc-sortable-list--gap-lg')).toBe(true)
  })

  it('should default to md gap', () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
        })
      ),
      container
    )

    const list = container.querySelector('.bc-sortable-list')
    expect(list?.classList.contains('bc-sortable-list--gap-md')).toBe(true)
  })

  it('should apply custom class', () => {
    const items = prop(['A'])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item),
          keyOf: item => item,
          class: 'my-custom-class',
        })
      ),
      container
    )

    const list = container.querySelector('.bc-sortable-list')
    expect(list?.classList.contains('my-custom-class')).toBe(true)
  })

  it('should set data-key attribute on items', () => {
    const items = prop([
      { id: 'x', name: 'X' },
      { id: 'y', name: 'Y' },
    ])

    render(
      BeatUI(
        {},
        SortableList({
          items,
          onChange: () => {},
          renderItem: (item, handle) => html.div(handle, item.name),
          keyOf: item => item.id,
        })
      ),
      container
    )

    const listItems = container.querySelectorAll('.bc-sortable-list__item')
    expect(listItems[0].getAttribute('data-key')).toBe('x')
    expect(listItems[1].getAttribute('data-key')).toBe('y')
  })
})
