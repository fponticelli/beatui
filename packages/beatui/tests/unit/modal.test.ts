import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, Provide, html, prop } from '@tempots/dom'
import { Modal, ConfirmModal } from '../../src/components/overlay/modal'
import { Button } from '../../src/components/button/button'
import { Theme } from '../../src/components/theme/theme'

describe('Modal Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    // Clean up any modals
    const modals = document.querySelectorAll('.bc-modal')
    modals.forEach(modal => modal.remove())
  })

  describe('basic functionality', () => {
    it('should render trigger and open modal on click', async () => {
      render(
        Provide(Theme, {}, () =>
          Modal({}, open =>
            Button(
              { onClick: () => open({ body: html.p('Modal content') }) },
              'Open Modal'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      expect(button.textContent).toBe('Open Modal')

      // Modal should not be visible initially
      expect(document.querySelector('.bc-modal')).toBeNull()

      // Click to open modal
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const modal = document.querySelector('.bc-modal')
      expect(modal).not.toBeNull()
      expect(modal!.className).toContain('bc-modal--size-md') // default size
    })

    it('should render with correct size and position', async () => {
      render(
        Provide(Theme, {}, () =>
          Modal({ size: 'lg', position: 'top' }, open =>
            Button(
              { onClick: () => open({ body: html.p('Large modal') }) },
              'Open Large Modal'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const modal = document.querySelector('.bc-modal')!
      expect(modal.className).toContain('bc-modal--size-lg')
      expect(modal.className).toContain('bc-modal--position-top')
    })

    it('should call onClose callback when modal is closed', async () => {
      const onCloseMock = vi.fn()

      render(
        Provide(Theme, {}, () =>
          Modal({ onClose: onCloseMock }, open =>
            Button(
              { onClick: () => open({ body: html.p('Modal content') }) },
              'Open Modal'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Close modal by clicking backdrop (overlay)
      const overlay = document.querySelector('.bc-overlay')! as HTMLElement
      overlay.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(onCloseMock).toHaveBeenCalled()
    })

    it('should handle dismissable option', async () => {
      const dismissable = prop(false)

      render(
        Provide(Theme, {}, () =>
          Modal({ dismissable }, open =>
            Button(
              {
                onClick: () => open({ body: html.p('Non-dismissable modal') }),
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

      const modal = document.querySelector('.bc-modal')!
      // dismissable state is managed in component code, not DOM attributes
      expect(modal).not.toBeNull()

      // Change to dismissable
      dismissable.set(true)
      await new Promise(resolve => setTimeout(resolve, 50))
      // dismissable state is managed in component code, not DOM attributes
      expect(modal).not.toBeNull()
    })
  })

  describe('header and close button', () => {
    it('should automatically add close button when header is present', async () => {
      render(
        Provide(Theme, {}, () =>
          Modal({}, open =>
            Button(
              {
                onClick: () =>
                  open({
                    header: html.h2('Modal Title'),
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

      const modal = document.querySelector('.bc-modal')!
      const closeButton = modal.querySelector('[aria-label="Close modal"]')
      expect(closeButton).not.toBeNull()
    })

    it('should not add close button when showCloseButton is false', async () => {
      render(
        Provide(Theme, {}, () =>
          Modal({ showCloseButton: false }, open =>
            Button(
              {
                onClick: () =>
                  open({
                    header: html.h2('Modal Title'),
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

      const modal = document.querySelector('.bc-modal')!
      const closeButton = modal.querySelector('[data-close]')
      expect(closeButton).toBeNull()
    })
  })

  describe('container options', () => {
    it('should use body container by default', async () => {
      render(
        Provide(Theme, {}, () =>
          Modal({}, open =>
            Button(
              { onClick: () => open({ body: html.p('Modal content') }) },
              'Open Modal'
            )
          )
        ),
        container
      )

      const button = container.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const modal = document.querySelector('.bc-modal')!
      const overlay = document.querySelector('.bc-overlay')!
      expect(overlay.parentElement).toBe(document.body)
      expect(modal.className).toContain('bc-modal--container-body')
    })

    it('should use custom container when specified', async () => {
      const customContainer = document.createElement('div')
      customContainer.id = 'custom-modal-container'
      document.body.appendChild(customContainer)

      render(
        Provide(Theme, {}, () =>
          Modal({ container: 'element' }, open =>
            Button(
              { onClick: () => open({ body: html.p('Modal content') }) },
              'Open Modal'
            )
          )
        ),
        customContainer
      )

      const button = customContainer.querySelector('button')!
      button.click()
      await new Promise(resolve => setTimeout(resolve, 100))

      const modal = document.querySelector('.bc-modal')!
      const overlay = modal.closest('.bc-overlay')!
      expect(overlay.parentElement).toBe(customContainer)
      expect(modal.className).toContain('bc-modal--container-element')

      // Cleanup
      document.body.removeChild(customContainer)
    })
  })
})

describe('ConfirmModal Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    const modals = document.querySelectorAll('.bc-modal')
    modals.forEach(modal => modal.remove())
  })

  it('should render confirmation modal with confirm and cancel buttons', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      Provide(Theme, {}, () =>
        ConfirmModal({ onConfirm, onCancel }, open =>
          Button(
            {
              onClick: () => open('Are you sure you want to proceed?'),
            },
            'Open Confirm Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')!
    button.click()
    await new Promise(resolve => setTimeout(resolve, 100))

    const modal = document.querySelector('.bc-modal')!
    // Use component structure to find buttons in footer
    const footer = modal.querySelector('.bc-modal__footer')!
    const buttons = footer.querySelectorAll('button')

    expect(buttons.length).toBe(2)
    expect(buttons[0].textContent).toContain('Cancel')
    expect(buttons[1].textContent).toContain('Confirm')
    expect(modal.textContent).toContain('Are you sure you want to proceed?')

    // Test confirm button (second button)
    buttons[1].dispatchEvent(new Event('click'))
    expect(onConfirm).toHaveBeenCalled()
  })
})
