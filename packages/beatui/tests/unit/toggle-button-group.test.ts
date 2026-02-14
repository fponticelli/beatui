import { describe, it, expect, vi } from 'vitest'
import { render, prop } from '@tempots/dom'
import { ToggleButtonGroup } from '../../src/components/button/toggle-button-group'
import { WithProviders } from '../helpers/test-providers'

function createContainer() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return container
}

describe('ToggleButtonGroup', () => {
  it('should render all items as toggle buttons', () => {
    const container = createContainer()
    const value = prop<string[]>([])
    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [
            { key: 'a', label: 'Alpha' },
            { key: 'b', label: 'Beta' },
            { key: 'c', label: 'Gamma' },
          ],
          value,
        })
      ),
      container
    )

    const group = container.querySelector('[role="group"]')
    expect(group).not.toBeNull()

    const buttons = group!.querySelectorAll('button')
    expect(buttons.length).toBe(3)
    expect(buttons[0].textContent).toBe('Alpha')
    expect(buttons[1].textContent).toBe('Beta')
    expect(buttons[2].textContent).toBe('Gamma')
  })

  it('should apply group CSS classes', () => {
    const container = createContainer()
    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [{ key: 'a', label: 'A' }],
          value: [],
        })
      ),
      container
    )

    const group = container.querySelector('.bc-toggle-button-group')
    expect(group).not.toBeNull()
    expect(group!.className).toContain('bc-toggle-button-group--horizontal')
    expect(group!.className).toContain('bc-toggle-button-group--rounded-sm')
  })

  it('should support vertical orientation', () => {
    const container = createContainer()
    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
          ],
          value: [],
          orientation: 'vertical',
        })
      ),
      container
    )

    const group = container.querySelector('.bc-toggle-button-group')
    expect(group!.className).toContain('bc-toggle-button-group--vertical')
  })

  it('should reflect pressed state from value', () => {
    const container = createContainer()
    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
          ],
          value: ['b'],
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false')
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true')
  })

  it('should toggle single selection on click', () => {
    const container = createContainer()
    const value = prop<string[]>([])
    const onChange = vi.fn((v: string[]) => value.set(v))

    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
          ],
          value,
          onChange,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')

    // Click first button
    buttons[0].click()
    expect(onChange).toHaveBeenCalledWith(['a'])
  })

  it('should deselect previous in single-selection mode', async () => {
    const container = createContainer()
    const value = prop<string[]>(['a'])
    const onChange = vi.fn((v: string[]) => value.set(v))

    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
          ],
          value,
          onChange,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')

    // Click second button — should replace 'a' with 'b'
    buttons[1].click()
    expect(onChange).toHaveBeenCalledWith(['b'])

    await new Promise(resolve => setTimeout(resolve, 0))

    // Verify the DOM updated
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false')
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true')
  })

  it('should allow deselecting in single-selection mode', () => {
    const container = createContainer()
    const value = prop<string[]>(['a'])
    const onChange = vi.fn((v: string[]) => value.set(v))

    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
          ],
          value,
          onChange,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')

    // Click the already-selected button to deselect
    buttons[0].click()
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('should allow multiple selection when multiple is true', () => {
    const container = createContainer()
    const value = prop<string[]>(['a'])
    const onChange = vi.fn((v: string[]) => value.set(v))

    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
            { key: 'c', label: 'C' },
          ],
          value,
          onChange,
          multiple: true,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')

    // Click second button — should add 'b' alongside 'a'
    buttons[1].click()
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('should allow deselecting in multiple mode', () => {
    const container = createContainer()
    const value = prop<string[]>(['a', 'b'])
    const onChange = vi.fn((v: string[]) => value.set(v))

    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
          ],
          value,
          onChange,
          multiple: true,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')

    // Click 'a' to deselect it
    buttons[0].click()
    expect(onChange).toHaveBeenCalledWith(['b'])
  })

  it('should disable all buttons when group is disabled', () => {
    const container = createContainer()
    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
          ],
          value: [],
          disabled: true,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    expect(buttons[0].disabled).toBe(true)
    expect(buttons[1].disabled).toBe(true)
  })

  it('should disable individual items', () => {
    const container = createContainer()
    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B', disabled: true },
          ],
          value: [],
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    expect(buttons[0].disabled).toBe(false)
    expect(buttons[1].disabled).toBe(true)
  })

  it('should not fire onChange for disabled button clicks', () => {
    const container = createContainer()
    const onChange = vi.fn()

    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [
            { key: 'a', label: 'A', disabled: true },
          ],
          value: [],
          onChange,
        })
      ),
      container
    )

    const button = container.querySelector('button')!
    button.click()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('should have aria-orientation attribute', () => {
    const container = createContainer()
    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [{ key: 'a', label: 'A' }],
          value: [],
          orientation: 'vertical',
        })
      ),
      container
    )

    const group = container.querySelector('[role="group"]')
    expect(group!.getAttribute('aria-orientation')).toBe('vertical')
  })

  it('should apply custom roundedness', () => {
    const container = createContainer()
    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [{ key: 'a', label: 'A' }],
          value: [],
          roundedness: 'lg',
        })
      ),
      container
    )

    const group = container.querySelector('.bc-toggle-button-group')
    expect(group!.className).toContain('bc-toggle-button-group--rounded-lg')
  })

  it('should strip border-radius from child buttons', () => {
    const container = createContainer()
    render(
      WithProviders(() =>
        ToggleButtonGroup({
          items: [
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B' },
          ],
          value: [],
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    // Buttons should have roundedness 'none' applied
    expect(buttons[0].className).toContain('bc-control--rounded-none')
    expect(buttons[1].className).toContain('bc-control--rounded-none')
  })
})
