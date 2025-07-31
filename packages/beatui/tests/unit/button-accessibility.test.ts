import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { Button } from '../../src/components/button/button'
import { WithProviders } from '../helpers/test-providers'

describe('Button Accessibility', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('Basic accessibility', () => {
    it('should have proper button type by default', () => {
      render(
        WithProviders(() => Button({}, 'Click me')),
        container
      )

      const button = container.querySelector('button')!
      expect(button.getAttribute('type')).toBe('button')
    })

    it('should support custom button types', () => {
      render(
        WithProviders(() => Button({ type: 'submit' }, 'Submit')),
        container
      )

      const button = container.querySelector('button')!
      expect(button.getAttribute('type')).toBe('submit')
    })

    it('should be disabled when disabled prop is true', () => {
      render(
        WithProviders(() => Button({ disabled: true }, 'Disabled')),
        container
      )

      const button = container.querySelector('button')!
      expect(button.disabled).toBe(true)
    })
  })

  describe('Loading state accessibility', () => {
    it('should have aria-busy when loading', () => {
      render(
        WithProviders(() => Button({ loading: true }, 'Loading')),
        container
      )

      const button = container.querySelector('button')!
      expect(button.getAttribute('aria-busy')).toBe('true')
    })

    it('should not have aria-busy when not loading', () => {
      render(
        WithProviders(() => Button({ loading: false }, 'Not loading')),
        container
      )

      const button = container.querySelector('button')!
      expect(button.getAttribute('aria-busy')).toBe('false')
    })

    it('should be disabled when loading', () => {
      render(
        WithProviders(() => Button({ loading: true }, 'Loading')),
        container
      )

      const button = container.querySelector('button')!
      expect(button.disabled).toBe(true)
    })

    it('should have aria-label when loading', () => {
      render(
        WithProviders(() => Button({ loading: true }, 'Loading')),
        container
      )

      const button = container.querySelector('button')!
      expect(button.getAttribute('aria-label')).toBe('Loading, please wait')
    })

    it('should not have aria-label when not loading', () => {
      render(
        WithProviders(() => Button({ loading: false }, 'Not loading')),
        container
      )

      const button = container.querySelector('button')!
      expect(button.getAttribute('aria-label')).toBeNull()
    })

    it('should have live region for screen reader announcements when loading', () => {
      render(
        WithProviders(() => Button({ loading: true }, 'Loading')),
        container
      )

      const liveRegion = container.querySelector('[aria-live="polite"]')
      expect(liveRegion).not.toBeNull()
      expect(liveRegion!.textContent).toBe('Loading, please wait')
      expect(liveRegion!.className).toContain('sr-only')
    })

    it('should not have live region when not loading', () => {
      render(
        WithProviders(() => Button({ loading: false }, 'Not loading')),
        container
      )

      const liveRegion = container.querySelector('[aria-live="polite"]')
      expect(liveRegion).toBeNull()
    })

    it('should update accessibility attributes when loading state changes', async () => {
      const loading = prop(false)

      render(
        WithProviders(() => Button({ loading }, 'Dynamic loading')),
        container
      )

      const button = container.querySelector('button')!

      // Initially not loading
      expect(button.getAttribute('aria-busy')).toBe('false')
      expect(button.disabled).toBe(false)
      expect(button.getAttribute('aria-label')).toBeNull()
      expect(container.querySelector('[aria-live="polite"]')).toBeNull()

      // Set to loading
      loading.set(true)
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(button.getAttribute('aria-busy')).toBe('true')
      expect(button.disabled).toBe(true)
      expect(button.getAttribute('aria-label')).toBe('Loading, please wait')

      const liveRegion = container.querySelector('[aria-live="polite"]')
      expect(liveRegion).not.toBeNull()
      expect(liveRegion!.textContent).toBe('Loading, please wait')

      // Set back to not loading
      loading.set(false)
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(button.getAttribute('aria-busy')).toBe('false')
      expect(button.disabled).toBe(false)
      expect(button.getAttribute('aria-label')).toBeNull()
      expect(container.querySelector('[aria-live="polite"]')).toBeNull()
    })
  })

  describe('Combined states', () => {
    it('should be disabled when both disabled and loading are true', () => {
      render(
        WithProviders(() => Button({ disabled: true, loading: true }, 'Both')),
        container
      )

      const button = container.querySelector('button')!
      expect(button.disabled).toBe(true)
      expect(button.getAttribute('aria-busy')).toBe('true')
    })

    it('should prioritize loading state for aria-label when both disabled and loading', () => {
      render(
        WithProviders(() => Button({ disabled: true, loading: true }, 'Both')),
        container
      )

      const button = container.querySelector('button')!
      expect(button.getAttribute('aria-label')).toBe('Loading, please wait')
    })
  })

  describe('Focus management', () => {
    it('should be focusable when not disabled', () => {
      render(
        WithProviders(() => Button({}, 'Focusable')),
        container
      )

      const button = container.querySelector('button')!
      button.focus()
      expect(document.activeElement).toBe(button)
    })

    it('should not be focusable when disabled', () => {
      render(
        WithProviders(() => Button({ disabled: true }, 'Not focusable')),
        container
      )

      const button = container.querySelector('button')!
      button.focus()
      expect(document.activeElement).not.toBe(button)
    })

    it('should not be focusable when loading', () => {
      render(
        WithProviders(() => Button({ loading: true }, 'Loading')),
        container
      )

      const button = container.querySelector('button')!
      button.focus()
      expect(document.activeElement).not.toBe(button)
    })
  })

  describe('Click handling', () => {
    it('should call onClick when clicked and not disabled', () => {
      let clicked = false
      const onClick = () => {
        clicked = true
      }

      render(
        WithProviders(() => Button({ onClick }, 'Click me')),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      expect(clicked).toBe(true)
    })

    it('should not call onClick when disabled', () => {
      let clicked = false
      const onClick = () => {
        clicked = true
      }

      render(
        WithProviders(() => Button({ disabled: true, onClick }, 'Disabled')),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      expect(clicked).toBe(false)
    })

    it('should not call onClick when loading', () => {
      let clicked = false
      const onClick = () => {
        clicked = true
      }

      render(
        WithProviders(() => Button({ loading: true, onClick }, 'Loading')),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      expect(clicked).toBe(false)
    })
  })
})
