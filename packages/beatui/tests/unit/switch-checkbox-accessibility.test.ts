import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, prop } from '@tempots/dom'
import { Switch } from '../../src/components/form/input/switch'
import { CheckboxInput } from '../../src/components/form/input/checkbox-input'
import { WithProviders } from '../helpers/test-providers'

describe('Switch and Checkbox Accessibility', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('Switch Component', () => {
    it('should have proper ARIA role and attributes', () => {
      const value = prop(false)
      const onChange = vi.fn()

      render(
        WithProviders(() =>
          Switch({
            value,
            onChange,
            id: 'test-switch',
          })
        ),
        container
      )

      const switchElement = container.querySelector('[role="switch"]')!
      expect(switchElement.getAttribute('role')).toBe('switch')
      expect(switchElement.getAttribute('aria-checked')).toBe('false')
      expect(switchElement.getAttribute('id')).toBe('test-switch')
      expect(switchElement.getAttribute('tabindex')).toBe('0')
    })

    it('should update aria-checked when value changes', async () => {
      const value = prop(false)
      const onChange = vi.fn(newValue => value.set(newValue))

      render(
        WithProviders(() =>
          Switch({
            value,
            onChange,
          })
        ),
        container
      )

      const switchElement = container.querySelector('[role="switch"]')!
      expect(switchElement.getAttribute('aria-checked')).toBe('false')

      // Change value
      value.set(true)
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(switchElement.getAttribute('aria-checked')).toBe('true')
    })

    it('should be disabled with proper ARIA attributes', () => {
      const value = prop(false)
      const disabled = prop(true)
      const onChange = vi.fn()

      render(
        WithProviders(() =>
          Switch({
            value,
            onChange,
            disabled,
          })
        ),
        container
      )

      const switchElement = container.querySelector('[role="switch"]')!
      expect(switchElement.getAttribute('aria-disabled')).toBe('true')
      expect(switchElement.getAttribute('tabindex')).toBe('-1')
    })

    it('should handle keyboard navigation', () => {
      const value = prop(false)
      const onChange = vi.fn()

      render(
        WithProviders(() =>
          Switch({
            value,
            onChange,
          })
        ),
        container
      )

      const switchElement = container.querySelector('[role="switch"]')!

      // Test Space key
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      })
      switchElement.dispatchEvent(spaceEvent)
      expect(onChange).toHaveBeenCalledWith(true)
      expect(spaceEvent.defaultPrevented).toBe(true)

      // Test Enter key
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      })
      switchElement.dispatchEvent(enterEvent)
      expect(onChange).toHaveBeenCalledWith(true)
      expect(enterEvent.defaultPrevented).toBe(true)
    })

    it('should not respond to keyboard when disabled', () => {
      const value = prop(false)
      const disabled = prop(true)
      const onChange = vi.fn()

      render(
        WithProviders(() =>
          Switch({
            value,
            onChange,
            disabled,
          })
        ),
        container
      )

      const switchElement = container.querySelector('[role="switch"]')!

      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
      })
      switchElement.dispatchEvent(spaceEvent)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should handle on/off labels with proper accessibility', () => {
      const value = prop(true)
      const onChange = vi.fn()

      render(
        WithProviders(() =>
          Switch({
            value,
            onChange,
            onLabel: 'ON',
            offLabel: 'OFF',
          })
        ),
        container
      )

      const onLabel = container.querySelector('.bc-switch__track-label--on')!
      const offLabel = container.querySelector('.bc-switch__track-label--off')!

      expect(onLabel).not.toBeNull()
      expect(offLabel).not.toBeNull()
      expect(offLabel.getAttribute('aria-hidden')).toBe('true')
    })

    it('should support different sizes while maintaining accessibility', () => {
      const value = prop(false)
      const onChange = vi.fn()

      render(
        WithProviders(() =>
          Switch({
            value,
            onChange,
            size: 'lg',
          })
        ),
        container
      )

      const switchElement = container.querySelector('[role="switch"]')!
      expect(switchElement.className).toContain('bc-switch--lg')
      expect(switchElement.getAttribute('role')).toBe('switch')
      expect(switchElement.getAttribute('aria-checked')).toBe('false')
    })
  })

  describe('CheckboxInput Component', () => {
    it('should have proper checkbox semantics', () => {
      const value = prop(false)

      render(
        WithProviders(() =>
          CheckboxInput({
            value,
            placeholder: 'Accept terms',
            onChange: () => {},
            id: 'test-checkbox',
          })
        ),
        container
      )

      const checkbox = container.querySelector(
        '[role="checkbox"]'
      )! as HTMLElement
      expect(checkbox.getAttribute('role')).toBe('checkbox')
      expect(checkbox.getAttribute('id')).toBe('test-checkbox')
      expect(checkbox.getAttribute('aria-checked')).toBe('false')
    })

    it('should have proper label association', () => {
      const value = prop(false)

      render(
        WithProviders(() =>
          CheckboxInput({
            value,
            placeholder: 'I agree to the terms',
            onChange: () => {},
            id: 'terms-checkbox',
          })
        ),
        container
      )

      const checkbox = container.querySelector('[role="checkbox"]')!
      const label = container.querySelector('label')!

      expect(label.getAttribute('for')).toBe('terms-checkbox')
      expect(checkbox.getAttribute('aria-labelledby')).toBe(
        'terms-checkbox-label'
      )
      expect(label.textContent).toContain('I agree to the terms')
    })

    it('should update checked state correctly', async () => {
      const value = prop(false)

      render(
        WithProviders(() =>
          CheckboxInput({
            value,
            placeholder: 'Dynamic checkbox',
            onChange: () => {},
          })
        ),
        container
      )

      const checkbox = container.querySelector(
        '[role="checkbox"]'
      ) as HTMLElement
      expect(checkbox.getAttribute('aria-checked')).toBe('false')

      value.set(true)
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(checkbox.getAttribute('aria-checked')).toBe('true')
    })

    it('should be focusable and keyboard accessible', () => {
      const value = prop(false)
      let clicked = false
      const onChange = () => {
        clicked = true
      }

      render(
        WithProviders(() =>
          CheckboxInput({
            value,
            placeholder: 'Keyboard checkbox',
            onChange,
          })
        ),
        container
      )

      const checkbox = container.querySelector(
        '[role="checkbox"]'
      )! as HTMLElement

      // Test focus
      checkbox.focus()
      expect(document.activeElement).toBe(checkbox)

      // Test click
      checkbox.click()
      expect(clicked).toBe(true)
    })
  })

  describe('Comparison: Switch vs Checkbox', () => {
    it('should use different roles for different semantics', () => {
      const switchValue = prop(false)
      const checkboxValue = prop(false)

      render(
        WithProviders(() => [
          Switch({
            value: switchValue,
            onChange: () => {},
            id: 'test-switch',
          }),
          CheckboxInput({
            value: checkboxValue,
            placeholder: 'Checkbox control',
            onChange: () => {},
            id: 'test-checkbox',
          }),
        ]),
        container
      )

      const switchElement = container.querySelector('#test-switch')!
      const checkboxElement = container.querySelector('#test-checkbox')!

      expect(switchElement.getAttribute('role')).toBe('switch')
      expect(checkboxElement.getAttribute('role')).toBe('checkbox')
      expect(checkboxElement.getAttribute('aria-checked')).toBeDefined() // Custom checkbox
    })
  })
})
