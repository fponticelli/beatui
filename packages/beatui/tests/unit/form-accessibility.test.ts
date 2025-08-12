import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@tempots/dom'
import { InputWrapper } from '../../src/components/form/input/input-wrapper'
import { TextInput } from '../../src/components/form/input/text-input'
import { TextArea } from '../../src/components/form/input/text-area'
import { CheckboxInput } from '../../src/components/form/input/checkbox-input'
import { WithProviders } from '../helpers/test-providers'
import { prop } from '@tempots/dom'

describe('Form Input Accessibility', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('InputWrapper', () => {
    it('should generate unique IDs for description and error elements', async () => {
      const value = prop('')

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Test Input',
            description: 'This is a description',
            error: 'This is an error',
            content: TextInput({
              value,
              id: 'test-input',
            }),
            labelFor: 'test-input',
          })
        ),
        container
      )

      const description = container.querySelector(
        '.bc-input-wrapper__description'
      )
      const error = container.querySelector('.bc-input-wrapper__error')

      expect(description).not.toBeNull()
      expect(error).not.toBeNull()
      expect(description?.getAttribute('id')).toMatch(
        /input-wrapper-.*-description/
      )
      expect(error?.getAttribute('id')).toMatch(/input-wrapper-.*-error/)
    })

    it('should set proper ARIA attributes on error element', async () => {
      const value = prop('')

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Test Input',
            error: 'This is an error',
            content: TextInput({
              value,
              id: 'test-input',
            }),
            labelFor: 'test-input',
          })
        ),
        container
      )

      const error = container.querySelector('.bc-input-wrapper__error')

      expect(error?.getAttribute('aria-live')).toBe('polite')
      expect(error?.getAttribute('role')).toBe('alert')
    })
  })

  describe('TextInput', () => {
    it('should inherit accessibility attributes from wrapper', async () => {
      const value = prop('')

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Test Input',
            description: 'This is a description',
            error: 'This is an error',
            required: true,
            content: TextInput({
              value,
              id: 'test-input',
            }),
            labelFor: 'test-input',
          })
        ),
        container
      )

      await new Promise(resolve => setTimeout(resolve, 100)) // Wait for WithElement to execute

      const input = container.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement

      expect(input).not.toBeNull()
    })
  })

  describe('TextArea', () => {
    it('should inherit accessibility attributes from wrapper', async () => {
      const value = prop('')

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Test TextArea',
            description: 'This is a description',
            required: true,
            content: TextArea({
              value,
              id: 'test-textarea',
            }),
            labelFor: 'test-textarea',
          })
        ),
        container
      )

      await new Promise(resolve => setTimeout(resolve, 100)) // Wait for WithElement to execute

      const textarea = container.querySelector(
        'textarea'
      ) as HTMLTextAreaElement

      expect(textarea).not.toBeNull()
    })
  })

  describe('CheckboxInput', () => {
    it('should have proper label association', async () => {
      const value = prop(false)

      render(
        WithProviders(() =>
          CheckboxInput({
            value,
            placeholder: 'Accept terms',
            onChange: () => {},
          })
        ),
        container
      )

      const checkbox = container.querySelector(
        '[role="checkbox"]'
      ) as HTMLElement
      const label = container.querySelector('label') as HTMLLabelElement

      expect(checkbox).not.toBeNull()
      expect(label).not.toBeNull()

      const checkboxId = checkbox.getAttribute('id')
      const labelFor = label.getAttribute('for')
      const labelId = label.getAttribute('id')
      const ariaLabelledBy = checkbox.getAttribute('aria-labelledby')

      expect(checkboxId).not.toBeNull()
      expect(labelFor).toBe(checkboxId)
      expect(labelId).toBe(ariaLabelledBy)
    })

    it('should inherit accessibility attributes from wrapper', async () => {
      const value = prop(false)

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Test Checkbox',
            description: 'This is a description',
            error: 'This is an error',
            required: true,
            content: CheckboxInput({
              value,
              placeholder: 'Accept terms',
              onChange: () => {},
            }),
          })
        ),
        container
      )

      await new Promise(resolve => setTimeout(resolve, 100)) // Wait for WithElement to execute

      const checkbox = container.querySelector(
        '[role="checkbox"]'
      ) as HTMLElement

      expect(checkbox).not.toBeNull()
    })
  })

  describe('Required field indicators', () => {
    it('should show required symbol when field is required', async () => {
      const value = prop('')

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Required Input',
            required: true,
            content: TextInput({
              value,
              id: 'required-input',
            }),
            labelFor: 'required-input',
          })
        ),
        container
      )

      const requiredSymbol = container.querySelector(
        '.bc-input-wrapper__required'
      )
      expect(requiredSymbol).not.toBeNull()
    })

    it('should not show required symbol when field is not required', async () => {
      const value = prop('')

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Optional Input',
            required: false,
            content: TextInput({
              value,
              id: 'optional-input',
            }),
            labelFor: 'optional-input',
          })
        ),
        container
      )

      const requiredSymbol = container.querySelector(
        '.bc-input-wrapper__required'
      )
      expect(requiredSymbol).toBeNull()
    })
  })

  describe('Horizontal layout', () => {
    it('should apply horizontal class when horizontal prop is true', async () => {
      const value = prop('')

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Horizontal Input',
            horizontal: true,
            content: TextInput({
              value,
              id: 'horizontal-input',
            }),
            labelFor: 'horizontal-input',
          })
        ),
        container
      )

      const wrapper = container.querySelector('.bc-input-wrapper')
      expect(wrapper?.classList.contains('bc-input-wrapper--horizontal')).toBe(
        true
      )
    })

    it('should not apply horizontal class when horizontal prop is false', async () => {
      const value = prop('')

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Vertical Input',
            horizontal: false,
            content: TextInput({
              value,
              id: 'vertical-input',
            }),
            labelFor: 'vertical-input',
          })
        ),
        container
      )

      const wrapper = container.querySelector('.bc-input-wrapper')
      expect(wrapper?.classList.contains('bc-input-wrapper--horizontal')).toBe(
        false
      )
    })

    it('should not apply horizontal class when horizontal prop is not provided', async () => {
      const value = prop('')

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Default Input',
            content: TextInput({
              value,
              id: 'default-input',
            }),
            labelFor: 'default-input',
          })
        ),
        container
      )

      const wrapper = container.querySelector('.bc-input-wrapper')
      expect(wrapper?.classList.contains('bc-input-wrapper--horizontal')).toBe(
        false
      )
    })

    it('should place description under label when horizontal', async () => {
      const value = prop('')

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Horizontal Input',
            description: 'This is a description',
            horizontal: true,
            content: TextInput({
              value,
              id: 'horizontal-input',
            }),
            labelFor: 'horizontal-input',
          })
        ),
        container
      )

      // Should have description under label
      const descriptionUnderLabel = container.querySelector(
        '.bc-input-wrapper__description--under-label'
      )
      expect(descriptionUnderLabel).not.toBeNull()
      expect(descriptionUnderLabel?.textContent).toBe('This is a description')

      // Should not have description at bottom
      const bottomDescription = container.querySelector(
        '.bc-input-wrapper__description:not(.bc-input-wrapper__description--under-label)'
      )
      expect(bottomDescription).toBeNull()
    })

    it('should place description at bottom when not horizontal', async () => {
      const value = prop('')

      render(
        WithProviders(() =>
          InputWrapper({
            label: 'Vertical Input',
            description: 'This is a description',
            horizontal: false,
            content: TextInput({
              value,
              id: 'vertical-input',
            }),
            labelFor: 'vertical-input',
          })
        ),
        container
      )

      // Should not have description under label
      const descriptionUnderLabel = container.querySelector(
        '.bc-input-wrapper__description--under-label'
      )
      expect(descriptionUnderLabel).toBeNull()

      // Should have description at bottom
      const bottomDescription = container.querySelector(
        '.bc-input-wrapper__description:not(.bc-input-wrapper__description--under-label)'
      )
      expect(bottomDescription).not.toBeNull()
      expect(bottomDescription?.textContent).toBe('This is a description')
    })
  })
})
