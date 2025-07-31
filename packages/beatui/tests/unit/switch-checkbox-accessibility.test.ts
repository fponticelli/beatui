import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, prop } from '@tempots/dom'
import { Switch } from '../../src/components/form/input/switch'
import { CheckboxInput } from '../../src/components/form/input/checkbox-input'
import { InputWrapper } from '../../src/components/form/input/input-wrapper'
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
            label: 'Test Switch',
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

    it('should have proper label association', () => {
      const value = prop(false)
      const onChange = vi.fn()

      render(
        WithProviders(() =>
          Switch({
            value,
            onChange,
            label: 'Accessibility Switch',
            id: 'accessibility-switch',
          })
        ),
        container
      )

      const switchElement = container.querySelector('[role="switch"]')!
      const labelElement = container.querySelector(
        '#accessibility-switch-label'
      )!

      expect(labelElement).not.toBeNull()
      expect(switchElement.getAttribute('aria-labelledby')).toBe(
        'accessibility-switch-label'
      )
      expect(labelElement.textContent).toBe('Accessibility Switch')
    })

    it('should update aria-checked when value changes', async () => {
      const value = prop(false)
      const onChange = vi.fn(newValue => value.set(newValue))

      render(
        WithProviders(() =>
          Switch({
            value,
            onChange,
            label: 'Dynamic Switch',
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
            label: 'Disabled Switch',
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
            label: 'Keyboard Switch',
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
            label: 'Disabled Keyboard Switch',
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
            label: 'Labeled Switch',
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
            label: 'Large Switch',
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
        'input[type="checkbox"]'
      )! as HTMLInputElement
      expect(checkbox.getAttribute('type')).toBe('checkbox')
      expect(checkbox.getAttribute('id')).toBe('test-checkbox')
      expect(checkbox.checked).toBe(false)
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

      const checkbox = container.querySelector('input[type="checkbox"]')!
      const label = container.querySelector('label')!

      expect(label.getAttribute('for')).toBe('terms-checkbox')
      expect(checkbox.getAttribute('aria-labelledby')).toBe(
        'terms-checkbox-label'
      )
      expect(label.textContent).toContain('I agree to the terms')
    })

    it('should inherit accessibility attributes from InputWrapper', async () => {
      const value = prop(false)

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Terms and Conditions',
            description: 'Please read and accept our terms',
            error: 'You must accept the terms',
            required: true,
            content: CheckboxInput({
              value,
              placeholder: 'I accept the terms',
              onChange: () => {},
            }),
          })
        ),
        container
      )

      await new Promise(resolve => setTimeout(resolve, 100))

      const checkbox = container.querySelector('input[type="checkbox"]')!
      expect(checkbox.getAttribute('aria-describedby')).toMatch(
        /input-wrapper-.*-description input-wrapper-.*-error/
      )
      expect(checkbox.getAttribute('aria-required')).toBe('true')
      expect(checkbox.getAttribute('aria-invalid')).toBe('true')
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
        'input[type="checkbox"]'
      ) as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      value.set(true)
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(checkbox.checked).toBe(true)
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
        'input[type="checkbox"]'
      )! as HTMLInputElement

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
            label: 'Switch control',
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
      expect(checkboxElement.getAttribute('type')).toBe('checkbox')
      expect(checkboxElement.getAttribute('role')).toBeNull() // Native checkbox role
    })

    it('should both support proper labeling patterns', () => {
      const switchValue = prop(false)
      const checkboxValue = prop(false)

      render(
        WithProviders(() => [
          Switch({
            value: switchValue,
            onChange: () => {},
            label: 'Enable notifications',
            id: 'notifications-switch',
          }),
          CheckboxInput({
            value: checkboxValue,
            placeholder: 'Subscribe to newsletter',
            onChange: () => {},
            id: 'newsletter-checkbox',
          }),
        ]),
        container
      )

      const switchElement = container.querySelector('#notifications-switch')!
      const checkboxElement = container.querySelector('#newsletter-checkbox')!

      // Both should have proper labeling
      expect(switchElement.getAttribute('aria-labelledby')).toBe(
        'notifications-switch-label'
      )
      expect(checkboxElement.getAttribute('aria-labelledby')).toBe(
        'newsletter-checkbox-label'
      )
    })
  })
})
