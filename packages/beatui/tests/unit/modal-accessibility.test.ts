import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, Provide, html } from '@tempots/dom'
import { Modal } from '../../src/components/overlay/modal'
import { Button } from '../../src/components/button/button'
import { Theme } from '../../src/components/theme/theme'

describe('Modal Accessibility', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('ARIA attributes', () => {
    it('should have proper dialog role and ARIA attributes', async () => {
      render(
        Provide(Theme, {}, () =>
          Modal({}, open =>
            Button(
              {
                onClick: () =>
                  open({
                    header: html.h2('Test Modal'),
                    body: html.p('Modal content'),
                  }),
              },
              'Open Modal'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const modal = document.querySelector('[role="dialog"]')!
      expect(modal).not.toBeNull()
      expect(modal.getAttribute('role')).toBe('dialog')
      expect(modal.getAttribute('aria-modal')).toBe('true')
      expect(modal.getAttribute('aria-labelledby')).toMatch(/modal-.*-header/)
      expect(modal.getAttribute('aria-describedby')).toMatch(/modal-.*-body/)
      expect(modal.getAttribute('tabindex')).toBe('-1')
      expect(modal.getAttribute('data-focustrap')).toBe('true')
    })

    it('should have proper ARIA labeling when header is provided', async () => {
      render(
        Provide(Theme, {}, () =>
          Modal({}, open =>
            Button(
              {
                onClick: () =>
                  open({
                    header: html.h2('Test Modal'),
                    body: html.p('Modal content'),
                  }),
              },
              'Open Modal'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const modal = document.querySelector('[role="dialog"]')!
      const labelledBy = modal.getAttribute('aria-labelledby')
      const describedBy = modal.getAttribute('aria-describedby')

      // Should have aria-labelledby when header is provided
      expect(labelledBy).not.toBeNull()
      expect(describedBy).not.toBeNull()

      // Should be able to find the referenced elements
      const header = document.getElementById(labelledBy!)
      const body = document.getElementById(describedBy!)
      expect(header).not.toBeNull()
      expect(body).not.toBeNull()
    })
  })

  describe('Focus management', () => {
    it('should focus the close button when modal opens', async () => {
      render(
        Provide(Theme, {}, () =>
          Modal({}, open =>
            Button(
              {
                onClick: () =>
                  open({
                    header: html.h2('Test Modal'),
                    body: html.p('Modal content'),
                  }),
              },
              'Open Modal'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 200)) // Wait for focus

      const closeButton = document.querySelector(
        '[aria-label="Close modal"]'
      ) as HTMLElement
      expect(closeButton).not.toBeNull()
      expect(document.activeElement).toStrictEqual(closeButton)
    })

    it('should focus first focusable element when no close button', async () => {
      render(
        Provide(Theme, {}, () =>
          Modal({ showCloseButton: false }, open =>
            Button(
              {
                onClick: () =>
                  open({
                    body: html.div(
                      Button({ onClick: () => {} }, 'First Button'),
                      Button({ onClick: () => {} }, 'Second Button')
                    ),
                  }),
              },
              'Open Modal'
            )
          )
        ),
        container
      )

      const openButton = container.querySelector('button')!
      openButton.click()
      await new Promise(resolve => setTimeout(resolve, 200)) // Wait for focus

      const firstButton = document.querySelector(
        '.bc-modal__body button'
      ) as HTMLElement
      expect(firstButton).not.toBeNull()
      expect(document.activeElement).toBe(firstButton)
    })
  })

  describe('Keyboard navigation', () => {
    it('should close modal on Escape key when dismissable', async () => {
      const onCloseMock = vi.fn()

      render(
        Provide(Theme, {}, () =>
          Modal({ onClose: onCloseMock }, open =>
            Button(
              {
                onClick: () =>
                  open({
                    header: html.h2('Test Modal'),
                    body: html.p('Modal content'),
                  }),
              },
              'Open Modal'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const modal = document.querySelector('[role="dialog"]')!
      expect(modal).not.toBeNull()

      // Simulate Escape key
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      })
      document.dispatchEvent(escapeEvent)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(onCloseMock).toHaveBeenCalled()
    })

    it('should not close modal on Escape key when not dismissable', async () => {
      const onCloseMock = vi.fn()

      render(
        Provide(Theme, {}, () =>
          Modal({ dismissable: false, onClose: onCloseMock }, open =>
            Button(
              {
                onClick: () =>
                  open({
                    header: html.h2('Test Modal'),
                    body: html.p('Modal content'),
                  }),
              },
              'Open Modal'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const modal = document.querySelector('[role="dialog"]')!
      expect(modal).not.toBeNull()

      // Simulate Escape key
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      })
      document.dispatchEvent(escapeEvent)
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(onCloseMock).not.toHaveBeenCalled()
      expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    })
  })

  describe('Close button accessibility', () => {
    it('should have proper aria-label on close button', async () => {
      render(
        Provide(Theme, {}, () =>
          Modal({}, open =>
            Button(
              {
                onClick: () =>
                  open({
                    header: html.h2('Test Modal'),
                    body: html.p('Modal content'),
                  }),
              },
              'Open Modal'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const closeButton = document.querySelector('[aria-label="Close modal"]')
      expect(closeButton).not.toBeNull()
      expect(closeButton?.getAttribute('aria-label')).toBe('Close modal')
    })
  })
})
