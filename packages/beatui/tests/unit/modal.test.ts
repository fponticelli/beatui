import { describe, it, expect, vi } from 'vitest'
import { render, Provide, html, attr, prop } from '@tempots/dom'
import {
  Modal,
  SimpleModal,
  ConfirmModal,
} from '../../src/components/overlay/modal'
import { Button } from '../../src/components/button/button'
import { Theme } from '../../src/components/theme/theme'

describe('Modal Component', () => {
  it('should render modal trigger without opening modal initially', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

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

    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.textContent).toBe('Open Modal')

    // Modal should not be visible initially
    const modal = document.querySelector('.bc-modal')
    expect(modal).toBeNull()
  })

  it('should open modal when trigger is clicked', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

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

    const button = container.querySelector('button')
    button!.click()

    // Modal should be visible after clicking
    setTimeout(() => {
      const modal = document.querySelector('.bc-modal')
      expect(modal).not.toBeNull()
      expect(modal!.className).toContain('bc-modal--size-md') // default size
    }, 100)
  })

  it('should render modal with correct size class', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Modal({ size: 'lg' }, open =>
          Button(
            { onClick: () => open({ body: html.p('Modal content') }) },
            'Open Large Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button!.click()

    setTimeout(() => {
      const modal = document.querySelector('.bc-modal')
      expect(modal).not.toBeNull()
      expect(modal!.className).toContain('bc-modal--size-lg')
    }, 100)
  })

  it('should call onClose callback when modal is closed', () => {
    const onCloseMock = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

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

    const button = container.querySelector('button')
    button!.click()

    // Simulate escape key press
    setTimeout(() => {
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escapeEvent)

      setTimeout(() => {
        expect(onCloseMock).toHaveBeenCalled()
      }, 100)
    }, 100)
  })

  it('should not close when dismissable is false', () => {
    const onCloseMock = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Modal(
          {
            dismissable: false,
            onClose: onCloseMock,
          },
          open =>
            Button(
              { onClick: () => open({ body: html.p('Modal content') }) },
              'Open Modal'
            )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button!.click()

    // Simulate escape key press - should not close
    setTimeout(() => {
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escapeEvent)

      setTimeout(() => {
        expect(onCloseMock).not.toHaveBeenCalled()
      }, 100)
    }, 100)
  })

  it('should use body container by default', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Modal({}, (open, _close) =>
          Button(
            { onClick: () => open({ body: html.p('Modal content') }) },
            'Open Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button!.click()

    // Modal should be rendered in body, not in the container
    setTimeout(() => {
      const modalInContainer = container.querySelector('.bc-modal')
      const modalInBody = document.body.querySelector('.bc-modal')
      expect(modalInContainer).toBeNull()
      expect(modalInBody).not.toBeNull()
    }, 100)
  })

  it('should use element container when specified', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Modal({ container: 'element' }, (open, _close) =>
          Button(
            { onClick: () => open({ body: html.p('Modal content') }) },
            'Open Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button!.click()

    // Modal should be rendered in the container element
    setTimeout(() => {
      const modalInContainer = container.querySelector('.bc-modal')
      expect(modalInContainer).not.toBeNull()
    }, 100)
  })

  it('should apply body container CSS class by default', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Modal({ container: 'body' }, (open, _close) =>
          Button(
            { onClick: () => open({ body: html.p('Modal content') }) },
            'Open Body Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button!.click()

    setTimeout(() => {
      const modal = document.querySelector('.bc-modal')
      expect(modal).not.toBeNull()
      expect(modal!.className).toContain('bc-modal--container-body')
    }, 100)
  })

  it('should apply element container CSS class when specified', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Modal({ container: 'element' }, (open, _close) =>
          Button(
            { onClick: () => open({ body: html.p('Modal content') }) },
            'Open Element Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button!.click()

    setTimeout(() => {
      const modal = container.querySelector('.bc-modal')
      expect(modal).not.toBeNull()
      expect(modal!.className).toContain('bc-modal--container-element')
    }, 100)
  })

  it('should have correct z-index for layering above sidebar', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Modal({}, (open, _close) =>
          Button(
            { onClick: () => open({ body: html.p('Modal content') }) },
            'Open Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button!.click()

    setTimeout(() => {
      const modal = document.querySelector('.bc-modal')
      expect(modal).not.toBeNull()

      // Check that the modal uses the z-index CSS variable
      const computedStyle = getComputedStyle(modal!)
      const zIndex = computedStyle.getPropertyValue('z-index')

      // The z-index should be 60 (from --z-index-modal token)
      expect(parseInt(zIndex)).toBeGreaterThan(20) // Greater than sidebar z-index
    }, 100)
  })

  it('should have normal cursor on modal content', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Modal({}, (open, _close) =>
          Button(
            { onClick: () => open({ body: html.p('Modal content') }) },
            'Open Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button!.click()

    setTimeout(() => {
      const modal = document.querySelector('.bc-modal')
      expect(modal).not.toBeNull()

      // Check that the modal has default cursor (not not-allowed)
      const computedStyle = getComputedStyle(modal!)
      const cursor = computedStyle.getPropertyValue('cursor')

      // Should be 'default' or 'auto', not 'not-allowed'
      expect(cursor).not.toBe('not-allowed')
    }, 100)
  })

  it('should automatically add close button to header when showCloseButton is true', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Modal({ showCloseButton: true }, (open, _close) =>
          Button(
            {
              onClick: () =>
                open({
                  header: html.div(
                    attr.class('bc-modal__header'),
                    html.h2('Test Modal')
                  ),
                  body: html.p('Modal content'),
                }),
            },
            'Open Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button!.click()

    setTimeout(() => {
      // Should have header wrapper with close button
      const headerWrapper = document.querySelector('.bc-modal__header-wrapper')
      expect(headerWrapper).not.toBeNull()

      // Should contain the original header
      const originalHeader = headerWrapper!.querySelector('.bc-modal__header')
      expect(originalHeader).not.toBeNull()

      // Should contain a close button
      const closeButton = headerWrapper!.querySelector('button[aria-label]')
      expect(closeButton).not.toBeNull()
    }, 100)
  })

  it('should not add close button to header when showCloseButton is false', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        Modal({ showCloseButton: false }, (open, _close) =>
          Button(
            {
              onClick: () =>
                open({
                  header: html.div(
                    attr.class('bc-modal__header'),
                    html.h2('Test Modal')
                  ),
                  body: html.p('Modal content'),
                }),
            },
            'Open Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button!.click()

    setTimeout(() => {
      // Should not have header wrapper
      const headerWrapper = document.querySelector('.bc-modal__header-wrapper')
      expect(headerWrapper).toBeNull()

      // Should have original header directly
      const originalHeader = document.querySelector('.bc-modal__header')
      expect(originalHeader).not.toBeNull()
    }, 100)
  })

  it('should reactively update mode when dismissable changes', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const dismissable = prop(true)

    render(
      Provide(Theme, {}, () =>
        Modal({ dismissable }, (open, _close) =>
          Button(
            {
              onClick: () =>
                open({
                  header: html.div(
                    attr.class('bc-modal__header'),
                    html.h2('Test Modal')
                  ),
                  body: html.p('Modal content'),
                }),
            },
            'Open Modal'
          )
        )
      ),
      container
    )

    const button = container.querySelector('button')
    button!.click()

    setTimeout(() => {
      const overlay = document.querySelector('.bc-overlay')
      expect(overlay).not.toBeNull()

      // Initially should be capturing mode
      expect(overlay!.className).toContain('bc-overlay--mode-capturing')

      // Change to non-dismissable
      dismissable.set(false)

      setTimeout(() => {
        // Should now be non-capturing mode
        expect(overlay!.className).toContain('bc-overlay--mode-non-capturing')

        // Change back to dismissable
        dismissable.set(true)

        setTimeout(() => {
          // Should be capturing mode again
          expect(overlay!.className).toContain('bc-overlay--mode-capturing')
        }, 50)
      }, 50)
    }, 100)
  })
})

describe('SimpleModal Component', () => {
  it('should render simple modal with body content', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        SimpleModal(
          {
            body: html.p('Simple modal content'),
          },
          (open, _close) => Button({ onClick: open }, 'Open Simple Modal')
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.textContent).toBe('Open Simple Modal')
  })
})

describe('ConfirmModal Component', () => {
  it('should render confirmation modal with confirm and cancel buttons', () => {
    const onConfirmMock = vi.fn()
    const onCancelMock = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        ConfirmModal(
          {
            message: 'Are you sure?',
            onConfirm: onConfirmMock,
            onCancel: onCancelMock,
          },
          (open, _close) => Button({ onClick: open }, 'Delete Item')
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.textContent).toBe('Delete Item')
  })

  it('should call onConfirm when confirm button is clicked', () => {
    const onConfirmMock = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
      Provide(Theme, {}, () =>
        ConfirmModal(
          {
            message: 'Are you sure?',
            onConfirm: onConfirmMock,
          },
          (open, _close) => Button({ onClick: open }, 'Delete Item')
        )
      ),
      container
    )

    const triggerButton = container.querySelector('button')
    triggerButton!.click()

    setTimeout(() => {
      const confirmButton = document.querySelector(
        '.bc-modal__actions button:last-child'
      )
      if (confirmButton) {
        ;(confirmButton as HTMLButtonElement).click()
        setTimeout(() => {
          expect(onConfirmMock).toHaveBeenCalled()
        }, 100)
      }
    }, 100)
  })
})
