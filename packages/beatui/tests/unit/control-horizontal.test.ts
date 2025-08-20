import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { TextControl } from '../../src/components/form/control/text-control'
import { WithProviders } from '../helpers/test-providers'
import { Controller } from '../../src/components/form/controller/controller'
import { ControllerValidation } from '../../src/components/form/controller/controller-validation'

describe('Control Components Horizontal Layout', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('TextControl', () => {
    it('should support horizontal layout', async () => {
      const value = prop('initial value')
      const status = prop<ControllerValidation>({ type: 'valid' })
      const disabled = prop(false)
      const controller = new Controller([], () => {}, value, status, {
        disabled,
      })

      render(
        WithProviders(() =>
          TextControl({
            controller,
            label: 'Test Input',
            description: 'This is a description',
            horizontal: true,
          })
        ),
        container
      )

      const wrapper = container.querySelector('.bc-input-wrapper')
      expect(wrapper?.classList.contains('bc-input-wrapper--horizontal')).toBe(
        true
      )

      // Should have description under label
      const descriptionUnderLabel = container.querySelector(
        '.bc-input-wrapper__description--under-label'
      )
      expect(descriptionUnderLabel).not.toBeNull()
      expect(descriptionUnderLabel?.textContent).toBe('This is a description')
    })

    it('should default to vertical layout when horizontal is not specified', async () => {
      const value = prop('initial value')
      const status = prop<ControllerValidation>({ type: 'valid' })
      const disabled = prop(false)
      const controller = new Controller([], () => {}, value, status, {
        disabled,
      })

      render(
        WithProviders(() =>
          TextControl({
            controller,
            label: 'Test Input',
            description: 'This is a description',
          })
        ),
        container
      )

      const wrapper = container.querySelector('.bc-input-wrapper')
      expect(wrapper?.classList.contains('bc-input-wrapper--horizontal')).toBe(
        false
      )

      // Should have description at bottom
      const bottomDescription = container.querySelector(
        '.bc-input-wrapper__description:not(.bc-input-wrapper__description--under-label)'
      )
      expect(bottomDescription).not.toBeNull()
      expect(bottomDescription?.textContent).toBe('This is a description')
    })

    it('should support horizontal layout with reactive value', async () => {
      const value = prop('initial value')
      const status = prop<ControllerValidation>({ type: 'valid' })
      const disabled = prop(false)
      const controller = new Controller([], () => {}, value, status, {
        disabled,
      })
      const horizontal = prop(false)

      render(
        WithProviders(() =>
          TextControl({
            controller,
            label: 'Test Input',
            description: 'This is a description',
            horizontal,
          })
        ),
        container
      )

      // Initially vertical
      let wrapper = container.querySelector('.bc-input-wrapper')
      expect(wrapper?.classList.contains('bc-input-wrapper--horizontal')).toBe(
        false
      )

      // Change to horizontal
      horizontal.set(true)
      await new Promise(resolve => setTimeout(resolve, 10))

      wrapper = container.querySelector('.bc-input-wrapper')
      expect(wrapper?.classList.contains('bc-input-wrapper--horizontal')).toBe(
        true
      )

      // Should have description under label
      const descriptionUnderLabel = container.querySelector(
        '.bc-input-wrapper__description--under-label'
      )
      expect(descriptionUnderLabel).not.toBeNull()
    })
  })
})
