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

    it('should set data attributes on content wrapper', async () => {
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

      const contentWrapper = container.querySelector(
        '.bc-input-wrapper__content'
      )

      expect(contentWrapper?.getAttribute('data-describedby')).toMatch(
        /input-wrapper-.*-description input-wrapper-.*-error/
      )
      expect(contentWrapper?.getAttribute('data-required')).toBe('true')
      expect(contentWrapper?.getAttribute('data-invalid')).toBe('true')
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
      expect(input.getAttribute('aria-describedby')).toMatch(
        /input-wrapper-.*-description input-wrapper-.*-error/
      )
      expect(input.getAttribute('aria-required')).toBe('true')
      expect(input.getAttribute('aria-invalid')).toBe('true')
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
      expect(textarea.getAttribute('aria-describedby')).toMatch(
        /input-wrapper-.*-description/
      )
      expect(textarea.getAttribute('aria-required')).toBe('true')
      expect(textarea.getAttribute('aria-invalid')).toBeNull() // No error, so should not be invalid
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
        'input[type="checkbox"]'
      ) as HTMLInputElement
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
        'input[type="checkbox"]'
      ) as HTMLInputElement

      expect(checkbox).not.toBeNull()
      expect(checkbox.getAttribute('aria-describedby')).toMatch(
        /input-wrapper-.*-description input-wrapper-.*-error/
      )
      expect(checkbox.getAttribute('aria-required')).toBe('true')
      expect(checkbox.getAttribute('aria-invalid')).toBe('true')
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
})
