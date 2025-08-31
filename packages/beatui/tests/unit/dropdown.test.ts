import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import {
  DropdownInput,
  DropdownOption,
} from '../../src/components/form/input/dropdown-input'
import { DropdownControl } from '../../src/components/form/input/dropdown-input'
import { WithProviders } from '../helpers/test-providers'
import { useController } from '../../src/components/form/use-form'

describe('Dropdown', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('Basic Functionality', () => {
    it('should render with basic options', () => {
      const value = prop<string>('')
      const options = prop<DropdownOption<string>[]>([
        DropdownOption.value('apple', 'Apple'),
        DropdownOption.value('banana', 'Banana'),
        DropdownOption.value('cherry', 'Cherry'),
      ])

      render(
        WithProviders(() =>
          DropdownInput({
            value,
            options,
            onChange: () => {},
          })
        ),
        container
      )

      const trigger = container.querySelector('.bc-dropdown')
      expect(trigger).not.toBeNull()
      expect(trigger?.getAttribute('role')).toBe('dropdown')
      expect(trigger?.getAttribute('aria-haspopup')).toBe('listbox')
      expect(trigger?.getAttribute('aria-expanded')).toBe('false')
    })

    it('should display selected value', () => {
      const value = prop<string>('apple')
      const options = prop<DropdownOption<string>[]>([
        DropdownOption.value('apple', 'Apple'),
        DropdownOption.value('banana', 'Banana'),
      ])

      render(
        WithProviders(() =>
          DropdownInput({
            value,
            options,
            onChange: () => {},
          })
        ),
        container
      )

      const display = container.querySelector('.bc-dropdown__display')
      expect(display?.textContent).toBe('Apple')
    })

    it('should show placeholder when no value selected', () => {
      const value = prop<string>('')
      const options = prop<DropdownOption<string>[]>([
        DropdownOption.value('apple', 'Apple'),
      ])

      render(
        WithProviders(() =>
          DropdownInput({
            value,
            options,
            placeholder: 'Select a fruit',
            onChange: () => {},
          })
        ),
        container
      )

      const display = container.querySelector('.bc-dropdown__display')
      expect(display?.textContent).toBe('Select a fruit')
    })
  })

  describe('Dropdown Interaction', () => {
    it('should open dropdown when trigger is clicked', async () => {
      const value = prop<string>('')
      const options = prop<DropdownOption<string>[]>([
        DropdownOption.value('apple', 'Apple'),
        DropdownOption.value('banana', 'Banana'),
      ])

      render(
        WithProviders(() =>
          DropdownInput({
            value,
            options,
            onChange: () => {},
          })
        ),
        container
      )

      const trigger = container.querySelector('.bc-dropdown') as HTMLElement
      trigger.click()

      // Wait for flyout to appear
      await new Promise(resolve => setTimeout(resolve, 100))

      const listbox = document.querySelector('.bc-dropdown__listbox')
      expect(listbox).not.toBeNull()
      expect(trigger.getAttribute('aria-expanded')).toBe('true')
    })

    it('should select option when clicked', async () => {
      const value = prop<string>('')
      let selectedValue = ''
      const options = prop<DropdownOption<string>[]>([
        DropdownOption.value('apple', 'Apple'),
        DropdownOption.value('banana', 'Banana'),
      ])

      render(
        WithProviders(() =>
          DropdownInput({
            value,
            options,
            onChange: val => {
              selectedValue = val
            },
          })
        ),
        container
      )

      const trigger = container.querySelector('.bc-dropdown') as HTMLElement
      trigger.click()

      await new Promise(resolve => setTimeout(resolve, 100))

      const appleOption = document.querySelector(
        '[data-value="apple"]'
      ) as HTMLElement
      if (appleOption) {
        appleOption.click()
        expect(selectedValue).toBe('apple')
      }
    })
  })

  describe('Keyboard Navigation', () => {
    it('should open dropdown with ArrowDown key', async () => {
      const value = prop<string>('')
      const options = prop<DropdownOption<string>[]>([
        DropdownOption.value('apple', 'Apple'),
        DropdownOption.value('banana', 'Banana'),
      ])

      render(
        WithProviders(() =>
          DropdownInput({
            value,
            options,
            onChange: () => {},
          })
        ),
        container
      )

      const trigger = container.querySelector('.bc-dropdown') as HTMLElement
      trigger.focus()

      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(trigger.getAttribute('aria-expanded')).toBe('true')
    })

    it('should navigate options with arrow keys', async () => {
      const value = prop<string>('')
      const options = prop<DropdownOption<string>[]>([
        DropdownOption.value('apple', 'Apple'),
        DropdownOption.value('banana', 'Banana'),
        DropdownOption.value('cherry', 'Cherry'),
      ])

      render(
        WithProviders(() =>
          DropdownInput({
            value,
            options,
            onChange: () => {},
          })
        ),
        container
      )

      const trigger = container.querySelector('.bc-dropdown') as HTMLElement
      trigger.focus()

      // Open dropdown
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )

      await new Promise(resolve => setTimeout(resolve, 100))

      // Navigate down
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )

      // Check if aria-activedescendant is set
      const activedescendant = trigger.getAttribute('aria-activedescendant')
      expect(activedescendant).toContain('dropdown-option-')
    })

    it('should select option with Enter key', async () => {
      const value = prop<string>('')
      let selectedValue = ''
      const options = prop<DropdownOption<string>[]>([
        DropdownOption.value('apple', 'Apple'),
        DropdownOption.value('banana', 'Banana'),
      ])

      render(
        WithProviders(() =>
          DropdownInput({
            value,
            options,
            onChange: val => {
              selectedValue = val
            },
          })
        ),
        container
      )

      const trigger = container.querySelector('.bc-dropdown') as HTMLElement
      trigger.focus()

      // Open dropdown and navigate to first option
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )

      await new Promise(resolve => setTimeout(resolve, 100))

      // Select with Enter
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      )

      // Wait for selection to complete and dropdown to close
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(selectedValue).toBe('apple')
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
    })

    it('should close dropdown with Escape key', async () => {
      const value = prop<string>('')
      const options = prop<DropdownOption<string>[]>([
        DropdownOption.value('apple', 'Apple'),
      ])

      render(
        WithProviders(() =>
          DropdownInput({
            value,
            options,
            onChange: () => {},
          })
        ),
        container
      )

      const trigger = container.querySelector('.bc-dropdown') as HTMLElement
      trigger.focus()

      // Open dropdown
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )

      await new Promise(resolve => setTimeout(resolve, 100))
      expect(trigger.getAttribute('aria-expanded')).toBe('true')

      // Close with Escape
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      )

      // Wait for dropdown to close
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(trigger.getAttribute('aria-expanded')).toBe('false')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const value = prop<string>('')
      const options = prop<DropdownOption<string>[]>([
        DropdownOption.value('apple', 'Apple'),
      ])

      render(
        WithProviders(() =>
          DropdownInput({
            value,
            options,
            onChange: () => {},
          })
        ),
        container
      )

      const trigger = container.querySelector('.bc-dropdown')
      expect(trigger?.getAttribute('role')).toBe('dropdown')
      expect(trigger?.getAttribute('aria-haspopup')).toBe('listbox')
      expect(trigger?.getAttribute('aria-expanded')).toBe('false')
      expect(trigger?.getAttribute('tabindex')).toBe('0')
    })

    it('should update aria-expanded when dropdown opens/closes', async () => {
      const value = prop<string>('')
      const options = prop<DropdownOption<string>[]>([
        DropdownOption.value('apple', 'Apple'),
      ])

      render(
        WithProviders(() =>
          DropdownInput({
            value,
            options,
            onChange: () => {},
          })
        ),
        container
      )

      const trigger = container.querySelector('.bc-dropdown') as HTMLElement
      expect(trigger.getAttribute('aria-expanded')).toBe('false')

      trigger.click()
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(trigger.getAttribute('aria-expanded')).toBe('true')
    })
  })

  describe('Form Integration', () => {
    it('should work with DropdownControl', () => {
      const { controller } = useController({
        initialValue: '',
      })

      const options = prop<DropdownOption<string>[]>([
        DropdownOption.value('apple', 'Apple'),
        DropdownOption.value('banana', 'Banana'),
      ])

      render(
        WithProviders(() =>
          DropdownControl({
            controller,
            options,
          })
        ),
        container
      )

      const trigger = container.querySelector('.bc-dropdown__trigger')
      expect(trigger).not.toBeNull()
    })
  })
})
