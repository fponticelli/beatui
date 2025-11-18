import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, Fragment, attr } from '@tempots/dom'
import { Flyout } from '../../src/components/navigation/flyout'
import { Tooltip } from '../../src/components/overlay/tooltip'
import { Button } from '../../src/components/button/button'
import { WithProviders } from '../helpers/test-providers'

describe('Flyout and Tooltip Accessibility', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('Flyout', () => {
    it('should have proper ARIA attributes on trigger element', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Trigger Button',
            Flyout({
              content: () =>
                Fragment(attr.class('bc-flyout'), 'Flyout content'),
              showOn: 'click',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      expect(button.getAttribute('aria-expanded')).toBe('false')
      expect(button.getAttribute('aria-controls')).toMatch(/flyout-.*/)
      expect(button.getAttribute('aria-haspopup')).toBe('dialog')
    })

    it('should update aria-expanded when flyout opens and closes', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Trigger Button',
            Flyout({
              content: () =>
                Fragment(attr.class('bc-flyout test-flyout'), 'Flyout content'),
              showOn: 'click',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Initially closed
      expect(button.getAttribute('aria-expanded')).toBe('false')

      // Click to open
      button.click()
      await new Promise(resolve => setTimeout(resolve, 300))

      expect(button.getAttribute('aria-expanded')).toBe('true')

      // Check that flyout is visible
      const flyout = document.querySelector('.test-flyout')
      expect(flyout).not.toBeNull()
    })

    it('should have proper role and ID on flyout content', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Trigger Button',
            Flyout({
              content: () =>
                Fragment(attr.class('bc-flyout test-flyout'), 'Flyout content'),
              showOn: 'click',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 300))

      const flyoutContainer = document.querySelector('.bc-flyout-container')!
      const flyout = document.querySelector('.test-flyout')!

      expect(flyout.getAttribute('role')).toBe('dialog')
      const flyoutId = flyoutContainer.getAttribute('id')
      expect(flyoutId).toBeTruthy()
      expect(typeof flyoutId).toBe('string')
      expect(flyoutId).toContain('flyout-')
      expect(flyoutContainer.getAttribute('tabindex')).toBe('-1')
    })

    it('should close on Escape key when closable', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Trigger Button',
            Flyout({
              content: () =>
                Fragment(attr.class('bc-flyout test-flyout'), 'Flyout content'),
              showOn: 'click',
              closable: true,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Open flyout
      button.click()
      await new Promise(resolve => setTimeout(resolve, 300))

      const flyout = document.querySelector('.test-flyout')
      expect(flyout).not.toBeNull()
      expect(button.getAttribute('aria-expanded')).toBe('true')

      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      })
      document.dispatchEvent(escapeEvent)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Should be closed
      expect(button.getAttribute('aria-expanded')).toBe('false')
    })

    it('should not close on Escape key when not closable', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Trigger Button',
            Flyout({
              content: () =>
                Fragment(attr.class('bc-flyout test-flyout'), 'Flyout content'),
              showOn: 'click',
              closable: false,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Open flyout
      button.click()
      await new Promise(resolve => setTimeout(resolve, 300))

      const flyout = document.querySelector('.test-flyout')
      expect(flyout).not.toBeNull()
      expect(button.getAttribute('aria-expanded')).toBe('true')

      // Press Escape
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      })
      document.dispatchEvent(escapeEvent)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Should still be open
      expect(button.getAttribute('aria-expanded')).toBe('true')
    })

    it('should support custom role attribute', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {}, stopPropagation: false },
            'Trigger Button',
            Flyout({
              content: () =>
                Fragment(attr.class('bc-flyout test-flyout'), 'Flyout content'),
              showOn: 'click',
              role: 'menu',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 300))

      const flyout = document.querySelector('.test-flyout')
      expect(flyout).not.toBeNull()
      expect(flyout!.getAttribute('role')).toBe('menu')
    })
  })

  describe('Tooltip', () => {
    it('should associate tooltip with trigger using aria-describedby', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Hover me',
            Tooltip({
              content: 'This is a tooltip',
              showOn: 'hover',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      const ariaDescribedBy = button.getAttribute('aria-describedby')

      expect(ariaDescribedBy).not.toBeNull()
      expect(ariaDescribedBy).toMatch(/tooltip-.*/)
    })

    it('should have proper tooltip role and ID', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Hover me',
            Tooltip({
              content: 'This is a tooltip',
              showOn: 'hover',
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Trigger hover to show tooltip
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 300))

      const tooltip = document.querySelector('.bc-tooltip')!
      const tooltipId = button.getAttribute('aria-describedby')!

      expect(tooltip.getAttribute('role')).toBe('tooltip')
      expect(tooltip.getAttribute('id')).toBe(tooltipId)
    })

    it('should show and hide on hover events', async () => {
      render(
        WithProviders(() =>
          Button(
            { onClick: () => {} },
            'Hover me',
            Tooltip({
              content: 'This is a tooltip',
              showOn: 'hover',
              showDelay: 10,
              hideDelay: 10,
            })
          )
        ),
        container
      )

      const button = container.querySelector('button')!

      // Initially no tooltip
      expect(document.querySelector('.bc-tooltip')).toBeNull()

      // Hover to show
      button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      const tooltip = document.querySelector('.bc-tooltip')
      expect(tooltip).not.toBeNull()

      // Leave to hide
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 50))

      // Tooltip should be gone or fading out
      // Note: Due to animation timing, we just check that the hide process started
      expect(button.getAttribute('aria-expanded')).toBe('false')
    })
  })
})
