import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop, html } from '@tempots/dom'
import { TransferList } from '../../src/components/form/input/transfer-list'
import { BeatUI } from '../../src/components/beatui'

describe('TransferList', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render two panels and action buttons', () => {
    const available = prop(['A', 'B', 'C'])
    const selected = prop<string[]>([])

    render(
      BeatUI(
        {},
        TransferList({
          available,
          selected,
          onChange: v => selected.set(v),
          renderItem: item => html.span(item),
          keyOf: item => item,
        })
      ),
      container
    )

    expect(container.querySelector('.bc-transfer-list')).not.toBeNull()

    const panels = container.querySelectorAll('.bc-transfer-list__panel')
    expect(panels.length).toBe(2)

    const actions = container.querySelector('.bc-transfer-list__actions')
    expect(actions).not.toBeNull()

    // 4 action buttons: move-right, move-all-right, move-all-left, move-left
    const buttons = actions!.querySelectorAll('.bc-button')
    expect(buttons.length).toBe(4)
  })

  it('should show available items in left panel', () => {
    const available = prop(['Apple', 'Banana', 'Cherry'])
    const selected = prop<string[]>([])

    render(
      BeatUI(
        {},
        TransferList({
          available,
          selected,
          onChange: v => selected.set(v),
          renderItem: item => html.span(item),
          keyOf: item => item,
        })
      ),
      container
    )

    const panels = container.querySelectorAll('.bc-transfer-list__panel')
    const leftItems = panels[0].querySelectorAll('.bc-transfer-list__item')
    expect(leftItems.length).toBe(3)
  })

  it('should show selected items in right panel', () => {
    const available = prop(['Apple', 'Banana', 'Cherry'])
    const selected = prop(['Banana'])

    render(
      BeatUI(
        {},
        TransferList({
          available,
          selected,
          onChange: v => selected.set(v),
          renderItem: item => html.span(item),
          keyOf: item => item,
        })
      ),
      container
    )

    const panels = container.querySelectorAll('.bc-transfer-list__panel')
    // Left should have 2 (Apple, Cherry — Banana is selected)
    const leftItems = panels[0].querySelectorAll('.bc-transfer-list__item')
    expect(leftItems.length).toBe(2)

    // Right should have 1 (Banana)
    const rightItems = panels[1].querySelectorAll('.bc-transfer-list__item')
    expect(rightItems.length).toBe(1)
  })

  it('should have role="group"', () => {
    const available = prop(['A'])
    const selected = prop<string[]>([])

    render(
      BeatUI(
        {},
        TransferList({
          available,
          selected,
          onChange: () => {},
          renderItem: item => html.span(item),
          keyOf: item => item,
        })
      ),
      container
    )

    const list = container.querySelector('.bc-transfer-list')
    expect(list?.getAttribute('role')).toBe('group')
  })

  it('should apply disabled class', () => {
    render(
      BeatUI(
        {},
        TransferList({
          available: ['A'],
          selected: [],
          onChange: () => {},
          renderItem: item => html.span(item),
          keyOf: item => item,
          disabled: true,
        })
      ),
      container
    )

    const list = container.querySelector('.bc-transfer-list')
    expect(list?.classList.contains('bc-transfer-list--disabled')).toBe(true)
  })

  it('should apply size class', () => {
    render(
      BeatUI(
        {},
        TransferList({
          available: ['A'],
          selected: [],
          onChange: () => {},
          renderItem: item => html.span(item),
          keyOf: item => item,
          size: 'lg',
        })
      ),
      container
    )

    const list = container.querySelector('.bc-transfer-list')
    expect(list?.classList.contains('bc-transfer-list--size-lg')).toBe(true)
  })

  it('should show panel headers', () => {
    render(
      BeatUI(
        {},
        TransferList({
          available: ['A'],
          selected: [],
          onChange: () => {},
          renderItem: item => html.span(item),
          keyOf: item => item,
        })
      ),
      container
    )

    const headers = container.querySelectorAll('.bc-transfer-list__panel-title')
    expect(headers.length).toBe(2)
    expect(headers[0].textContent).toBe('Available')
    expect(headers[1].textContent).toBe('Selected')
  })
})
