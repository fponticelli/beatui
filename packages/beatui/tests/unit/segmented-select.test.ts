import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { SegmentedSelect } from '../../src/components/form/input/segmented-select'
import { Option } from '../../src/components/form/input/option'
import { WithProviders } from '../helpers/test-providers'

describe('SegmentedSelect', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders segments for each value option', () => {
    render(
      WithProviders(() =>
        SegmentedSelect({
          options: [
            Option.value('a', 'Alpha'),
            Option.value('b', 'Beta'),
            Option.value('c', 'Gamma'),
          ],
          value: 'a',
        })
      ),
      container
    )
    const buttons = container.querySelectorAll('.bc-segmented-input__segment')
    expect(buttons.length).toBe(3)
    expect(buttons[0]!.textContent).toBe('Alpha')
    expect(buttons[1]!.textContent).toBe('Beta')
    expect(buttons[2]!.textContent).toBe('Gamma')
  })

  it('marks the selected segment as active', () => {
    render(
      WithProviders(() =>
        SegmentedSelect({
          options: [
            Option.value('a', 'Alpha'),
            Option.value('b', 'Beta'),
          ],
          value: 'b',
        })
      ),
      container
    )
    const buttons = container.querySelectorAll('.bc-segmented-input__segment')
    expect(buttons[0]!.classList.contains('bc-segmented-input__segment--inactive')).toBe(true)
    expect(buttons[1]!.classList.contains('bc-segmented-input__segment--active')).toBe(true)
  })

  it('fires onChange when a segment is clicked', () => {
    const onChange = vi.fn()
    render(
      WithProviders(() =>
        SegmentedSelect({
          options: [
            Option.value('a', 'Alpha'),
            Option.value('b', 'Beta'),
          ],
          value: 'a',
          onChange,
        })
      ),
      container
    )
    const buttons = container.querySelectorAll('.bc-segmented-input__segment')
    ;(buttons[1] as HTMLButtonElement).click()
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('does not fire onChange when disabled', () => {
    const onChange = vi.fn()
    render(
      WithProviders(() =>
        SegmentedSelect({
          options: [
            Option.value('a', 'Alpha'),
            Option.value('b', 'Beta'),
          ],
          value: 'a',
          onChange,
          disabled: true,
        })
      ),
      container
    )
    const buttons = container.querySelectorAll('.bc-segmented-input__segment')
    ;(buttons[1] as HTMLButtonElement).click()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not fire onChange for disabled individual options', () => {
    const onChange = vi.fn()
    render(
      WithProviders(() =>
        SegmentedSelect({
          options: [
            Option.value('a', 'Alpha'),
            Option.value('b', 'Beta', { disabled: true }),
          ],
          value: 'a',
          onChange,
        })
      ),
      container
    )
    const buttons = container.querySelectorAll('.bc-segmented-input__segment')
    ;(buttons[1] as HTMLButtonElement).click()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('flattens groups and ignores breaks', () => {
    render(
      WithProviders(() =>
        SegmentedSelect({
          options: [
            Option.value('a', 'Alpha'),
            Option.break,
            Option.group('Group', [
              Option.value('b', 'Beta'),
              Option.value('c', 'Gamma'),
            ]),
          ],
          value: 'a',
        })
      ),
      container
    )
    const buttons = container.querySelectorAll('.bc-segmented-input__segment')
    expect(buttons.length).toBe(3)
    expect(buttons[0]!.textContent).toBe('Alpha')
    expect(buttons[1]!.textContent).toBe('Beta')
    expect(buttons[2]!.textContent).toBe('Gamma')
  })

  it('supports custom equality', () => {
    type Item = { id: number; name: string }
    const onChange = vi.fn()
    render(
      WithProviders(() =>
        SegmentedSelect<Item>({
          options: [
            Option.value({ id: 1, name: 'One' }, 'One'),
            Option.value({ id: 2, name: 'Two' }, 'Two'),
          ],
          value: { id: 1, name: 'One' },
          equality: (a, b) => a.id === b.id,
          onChange,
        })
      ),
      container
    )
    const buttons = container.querySelectorAll('.bc-segmented-input__segment')
    expect(buttons[0]!.classList.contains('bc-segmented-input__segment--active')).toBe(true)
    ;(buttons[1] as HTMLButtonElement).click()
    expect(onChange).toHaveBeenCalledWith({ id: 2, name: 'Two' })
  })

  it('updates active segment reactively', async () => {
    const value = prop('a')
    const onChange = (v: string) => value.set(v)
    render(
      WithProviders(() =>
        SegmentedSelect({
          options: [
            Option.value('a', 'Alpha'),
            Option.value('b', 'Beta'),
          ],
          value,
          onChange,
        })
      ),
      container
    )
    const buttons = container.querySelectorAll('.bc-segmented-input__segment')
    expect(buttons[0]!.classList.contains('bc-segmented-input__segment--active')).toBe(true)
    expect(buttons[1]!.classList.contains('bc-segmented-input__segment--inactive')).toBe(true)

    // Simulate clicking the second option
    ;(buttons[1] as HTMLButtonElement).click()
    // Allow reactive updates to propagate
    await new Promise(resolve => setTimeout(resolve, 0))
    // Re-query since ForEach may recreate elements
    const updatedButtons = container.querySelectorAll('.bc-segmented-input__segment')
    expect(updatedButtons[0]!.classList.contains('bc-segmented-input__segment--inactive')).toBe(true)
    expect(updatedButtons[1]!.classList.contains('bc-segmented-input__segment--active')).toBe(true)
  })

  it('applies size class', () => {
    render(
      WithProviders(() =>
        SegmentedSelect({
          options: [Option.value('a', 'Alpha')],
          value: 'a',
          size: 'lg',
        })
      ),
      container
    )
    const el = container.querySelector('.bc-segmented-input')!
    expect(el.classList.contains('bc-segmented-input--size-lg')).toBe(true)
  })

  it('applies squared variant', () => {
    render(
      WithProviders(() =>
        SegmentedSelect({
          options: [Option.value('a', 'Alpha')],
          value: 'a',
          variant: 'squared',
        })
      ),
      container
    )
    const el = container.querySelector('.bc-segmented-input')!
    expect(el.classList.contains('bc-segmented-input--squared')).toBe(true)
  })

  it('updates segments when options signal changes', async () => {
    const options = prop([
      Option.value('a', 'Alpha'),
      Option.value('b', 'Beta'),
    ])
    render(
      WithProviders(() =>
        SegmentedSelect({
          options,
          value: 'a',
        })
      ),
      container
    )
    expect(container.querySelectorAll('.bc-segmented-input__segment').length).toBe(2)

    options.set([
      Option.value('x', 'X-ray'),
      Option.value('y', 'Yankee'),
      Option.value('z', 'Zulu'),
    ])
    // Allow reactive updates to propagate
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(container.querySelectorAll('.bc-segmented-input__segment').length).toBe(3)
    expect(container.querySelectorAll('.bc-segmented-input__segment')[0]!.textContent).toContain('X-ray')
  })
})
