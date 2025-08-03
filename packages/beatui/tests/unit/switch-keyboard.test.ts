import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@tempots/dom'
import { Switch } from '../../src/components/form/input/switch'
import { prop } from '@tempots/dom'
import { WithProviders } from '../helpers/test-providers'

describe('Switch Keyboard Accessibility', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should be focusable with tabindex=0 when enabled', () => {
    const value = prop(false)
    const onChange = vi.fn()

    const switchComponent = WithProviders(() =>
      Switch({
        value,
        onChange,
        label: 'Test Switch',
      })
    )

    render(switchComponent, container)

    const switchElement = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement
    expect(switchElement).toBeTruthy()
    expect(switchElement.getAttribute('tabindex')).toBe('0')
    expect(switchElement.getAttribute('role')).toBe('switch')
    expect(switchElement.getAttribute('aria-checked')).toBe('false')
  })

  it('should not be focusable when disabled', () => {
    const value = prop(false)
    const disabled = prop(true)
    const onChange = vi.fn()

    const switchComponent = WithProviders(() =>
      Switch({
        value,
        onChange,
        disabled,
        label: 'Disabled Switch',
      })
    )

    render(switchComponent, container)

    const switchElement = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement
    expect(switchElement.getAttribute('tabindex')).toBe('-1')
    expect(switchElement.getAttribute('aria-disabled')).toBe('true')
  })

  it('should toggle on Space key press', () => {
    const value = prop(false)
    const onChange = vi.fn()

    const switchComponent = WithProviders(() =>
      Switch({
        value,
        onChange,
        label: 'Test Switch',
      })
    )

    render(switchComponent, container)

    const switchElement = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement

    // Simulate Space key press
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    })

    switchElement.dispatchEvent(spaceEvent)

    expect(onChange).toHaveBeenCalledWith(true)
    expect(spaceEvent.defaultPrevented).toBe(true) // Should prevent page scroll
  })

  it('should toggle on Enter key press', () => {
    const value = prop(false)
    const onChange = vi.fn()

    const switchComponent = WithProviders(() =>
      Switch({
        value,
        onChange,
        label: 'Test Switch',
      })
    )

    render(switchComponent, container)

    const switchElement = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement

    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    })

    switchElement.dispatchEvent(enterEvent)

    expect(onChange).toHaveBeenCalledWith(true)
    expect(enterEvent.defaultPrevented).toBe(true)
  })

  it('should not toggle on other key presses', () => {
    const value = prop(false)
    const onChange = vi.fn()

    const switchComponent = WithProviders(() =>
      Switch({
        value,
        onChange,
        label: 'Test Switch',
      })
    )

    render(switchComponent, container)

    const switchElement = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement

    // Simulate other key presses
    const arrowEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    })

    switchElement.dispatchEvent(arrowEvent)

    expect(onChange).not.toHaveBeenCalled()
    expect(arrowEvent.defaultPrevented).toBe(false)
  })

  it('should not respond to keyboard when disabled', () => {
    const value = prop(false)
    const disabled = prop(true)
    const onChange = vi.fn()

    const switchComponent = WithProviders(() =>
      Switch({
        value,
        onChange,
        disabled,
        label: 'Disabled Switch',
      })
    )

    render(switchComponent, container)

    const switchElement = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement

    // Try to toggle with Space key
    const spaceEvent = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    })

    switchElement.dispatchEvent(spaceEvent)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('should have proper ARIA labeling', () => {
    const value = prop(true)
    const onChange = vi.fn()

    const switchComponent = WithProviders(() =>
      Switch({
        value,
        onChange,
        label: 'Accessibility Switch',
        id: 'test-switch',
      })
    )

    render(switchComponent, container)

    const switchElement = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement
    const labelElement = container.querySelector(
      '#test-switch-label'
    ) as HTMLElement

    expect(switchElement).toBeTruthy()
    expect(labelElement).toBeTruthy()
    expect(switchElement.getAttribute('id')).toBe('test-switch')
    expect(labelElement.getAttribute('id')).toBe('test-switch-label')
    expect(switchElement.getAttribute('aria-labelledby')).toBe(
      'test-switch-label'
    )
    expect(switchElement.getAttribute('aria-checked')).toBe('true')
  })

  it('should update aria-checked when value changes', () => {
    const value = prop(false)
    const onChange = vi.fn(newValue => value.set(newValue))

    const switchComponent = WithProviders(() =>
      Switch({
        value,
        onChange,
        label: 'Dynamic Switch',
      })
    )

    render(switchComponent, container)

    const switchElement = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement

    expect(switchElement.getAttribute('aria-checked')).toBe('false')

    // Toggle the switch
    value.set(true)

    // Wait for DOM update
    setTimeout(() => {
      expect(switchElement.getAttribute('aria-checked')).toBe('true')
    }, 0)
  })
})
