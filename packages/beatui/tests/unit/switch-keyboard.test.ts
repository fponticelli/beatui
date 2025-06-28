import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'
import { render } from '@tempots/dom'
import { Switch } from '../../src/components/form/input/switch'
import { prop } from '@tempots/dom'

describe('Switch Keyboard Accessibility', () => {
  let dom: JSDOM
  let document: Document
  let window: Window
  let container: HTMLElement

  beforeEach(() => {
    dom = new JSDOM(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            /* Mock CSS variables for testing */
            :root {
              --interactive-focus-light: #3b82f6;
              --interactive-focus-dark: #60a5fa;
              --radius-sm: 0.25rem;
              --spacing-base: 0.25rem;
              --color-primary-500: #3b82f6;
              --color-gray-300: #d1d5db;
            }

            .bc-switch {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              cursor: pointer;
            }

            .bc-switch:focus-visible {
              outline: 2px solid var(--interactive-focus-light);
              outline-offset: 2px;
              border-radius: var(--radius-sm);
            }

            .bc-switch__track {
              position: relative;
              border-radius: 9999px;
              padding: 0.25rem;
              transition: all 0.2s ease-in-out;
            }

            .bc-switch__track--off {
              background-color: var(--color-gray-300);
            }

            .bc-switch__track--on {
              background-color: var(--color-primary-500);
            }

            .bc-switch__thumb {
              width: 1rem;
              height: 1rem;
              background: white;
              border-radius: 50%;
              transition: transform 0.2s ease-in-out;
            }
          </style>
        </head>
        <body>
          <div id="container"></div>
        </body>
      </html>
    `,
      {
        pretendToBeVisual: true,
        resources: 'usable',
      }
    )

    document = dom.window.document
    window = dom.window as unknown as Window
    container = document.getElementById('container')!

    // Make globals available
    global.document = document
    global.window = window
    global.HTMLElement = dom.window.HTMLElement
    global.KeyboardEvent = dom.window.KeyboardEvent
  })

  it('should be focusable with tabindex=0 when enabled', () => {
    const value = prop(false)
    const onChange = vi.fn()

    const switchComponent = Switch({
      value,
      onChange,
      label: 'Test Switch',
    })

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

    const switchComponent = Switch({
      value,
      onChange,
      disabled,
      label: 'Disabled Switch',
    })

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

    const switchComponent = Switch({
      value,
      onChange,
      label: 'Test Switch',
    })

    render(switchComponent, container)

    const switchElement = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement

    // Simulate Space key press
    const spaceEvent = new dom.window.KeyboardEvent('keydown', {
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

    const switchComponent = Switch({
      value,
      onChange,
      label: 'Test Switch',
    })

    render(switchComponent, container)

    const switchElement = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement

    // Simulate Enter key press
    const enterEvent = new dom.window.KeyboardEvent('keydown', {
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

    const switchComponent = Switch({
      value,
      onChange,
      label: 'Test Switch',
    })

    render(switchComponent, container)

    const switchElement = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement

    // Simulate other key presses
    const arrowEvent = new dom.window.KeyboardEvent('keydown', {
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

    const switchComponent = Switch({
      value,
      onChange,
      disabled,
      label: 'Disabled Switch',
    })

    render(switchComponent, container)

    const switchElement = container.querySelector(
      '[role="switch"]'
    ) as HTMLElement

    // Try to toggle with Space key
    const spaceEvent = new dom.window.KeyboardEvent('keydown', {
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

    const switchComponent = Switch({
      value,
      onChange,
      label: 'Accessibility Switch',
      id: 'test-switch',
    })

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

    const switchComponent = Switch({
      value,
      onChange,
      label: 'Dynamic Switch',
    })

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
