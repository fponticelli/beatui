import {
  attr,
  html,
  TNode,
  Value,
  on,
  prop,
  Fragment,
  When,
  computedOf,
  aria,
  dataAttr,
} from '@tempots/dom'
import { Overlay } from './overlay'
import { Button } from '../button'
import { Icon } from '../data/icon'
import { OverlayEffect } from '../theme'
import { FocusTrap } from '@/utils/focus-trap'

export interface ModalOptions {
  /** Size of the modal */
  size?: Value<'sm' | 'md' | 'lg' | 'xl'>
  /** Whether the modal can be closed by clicking outside or pressing escape */
  dismissable?: Value<boolean>
  /** Whether to show the close button in header (only applies if header is provided) */
  showCloseButton?: Value<boolean>
  /** Callback when modal is closed */
  onClose?: () => void
  /** Overlay effect */
  overlayEffect?: Value<OverlayEffect>
  /** Container for the overlay: 'body' (default) or 'element' (current element) */
  container?: 'body' | 'element'
  /** Position of the modal: 'center' (default), 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right' */
  position?: Value<
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
  >
}

export interface ModalContentOptions {
  /** Optional header content - if provided, overrides title */
  header?: TNode
  /** Main body content */
  body: TNode
  /** Optional footer content with action items */
  footer?: TNode
}

/**
 * Modal component that provides a structured dialog with optional header, body, and footer
 * Built on top of the overlay component
 */
export function Modal(
  options: ModalOptions,
  fn: (open: (content: ModalContentOptions) => void, close: () => void) => TNode
): TNode {
  const {
    size = 'md',
    dismissable = true,
    showCloseButton = true,
    onClose,
    overlayEffect = 'opaque',
    container = 'body',
    position = 'center',
  } = options

  return Overlay((openOverlay, closeOverlay) => {
    let currentClose: () => void = () => {}

    const open = (content: ModalContentOptions) => {
      currentClose = closeOverlay
      // Create a reactive mode signal based on dismissable
      const mode = prop<'capturing' | 'non-capturing'>('capturing')

      // Update mode when dismissable changes
      Value.on(dismissable, isDismissable => {
        mode.set(isDismissable ? 'capturing' : 'non-capturing')
      })

      const displayHeader = computedOf(
        content.header != null,
        showCloseButton
      )((header, showCloseButton) => {
        return header || showCloseButton
      })

      // Generate unique IDs for accessibility
      const modalId = `modal-${Math.random().toString(36).substring(2, 11)}`
      const headerId = `${modalId}-header`
      const bodyId = `${modalId}-body`

      const modalContent = html.div(
        attr.class(
          computedOf(
            size,
            position
          )(
            (s, p) =>
              `bc-modal bc-modal--size-${s} bc-modal--container-${container} bc-modal--position-${p}`
          )
        ),

        // Essential ARIA attributes for modal dialog
        attr.role('dialog'),
        aria.modal(true),
        ...(content.header ? [aria.labelledby(headerId)] : []),
        aria.describedby(bodyId),
        attr.tabindex(-1), // Make modal focusable for initial focus
        attr.id(modalId),
        dataAttr.focusTrap('true'), // Mark as focus trap container

        on.mousedown(e => e.stopPropagation()), // Prevent overlay click-outside when clicking modal content

        // Focus trap implementation
        FocusTrap({
          escapeDeactivates: Value.get(dismissable),
          onEscape: () => {
            if (Value.get(dismissable)) {
              onClose?.()
              closeOverlay()
            }
          },
          initialFocus: () => {
            // Try to focus elements in order of preference
            const modal = document.getElementById(modalId)
            if (!modal) return null

            // Try to focus the close button first
            const closeButton = modal.querySelector(
              '[aria-label="Close modal"]'
            ) as HTMLElement
            if (closeButton) return closeButton

            // Then try any focusable element
            const firstFocusable = modal.querySelector(
              'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) as HTMLElement
            if (firstFocusable) return firstFocusable

            // Finally, focus the modal itself
            return modal
          },
        }),

        // Modal content container
        html.div(
          attr.class('bc-modal__content'),

          // Header section
          When(displayHeader, () =>
            html.div(
              attr.class('bc-modal__header'),
              html.div(
                ...(content.header ? [attr.id(headerId)] : []),
                content.header
              ),
              When(showCloseButton, () =>
                Button(
                  {
                    variant: 'text',
                    size: 'sm',
                    onClick: () => {
                      currentClose()
                      closeOverlay()
                    },
                  },
                  // TODO translation
                  aria.label('Close modal'),
                  Icon({ icon: 'line-md:close', size: 'sm' })
                )
              )
            )
          ),

          // Body section
          html.div(attr.class('bc-modal__body'), attr.id(bodyId), content.body),

          // Footer section
          content.footer &&
            html.div(attr.class('bc-modal__footer'), content.footer)
        )
      )

      openOverlay({
        mode,
        effect: (overlayEffect ?? 'opaque') as Value<OverlayEffect> | undefined,
        container,
        content: modalContent,
        onClickOutside: () => {
          onClose?.()
          closeOverlay()
        },
        onEscape: () => {
          onClose?.()
          closeOverlay()
        },
      })
    }

    const close = () => {
      currentClose()
      closeOverlay()
    }

    return fn(open, close)
  })
}

/**
 * Convenience function to create a confirmation modal
 */
export function ConfirmModal(
  options: ModalOptions & {
    confirmText?: Value<string>
    cancelText?: Value<string>
    onConfirm?: () => void
    onCancel?: () => void
  },
  fn: (open: (message: TNode) => void, close: () => void) => TNode
): TNode {
  const {
    // TODO translation
    confirmText = 'Confirm',
    // TODO translation
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    ...modalOptions
  } = options

  return Modal(
    { showCloseButton: false, ...modalOptions },
    (openModal, close) => {
      const handleConfirm = () => {
        onConfirm?.()
        close()
      }

      const handleCancel = () => {
        onCancel?.()
        close()
      }

      const open = (message: TNode) => {
        openModal({
          body: message,
          footer: Fragment(
            attr.class('bu-justify-end'),
            Button(
              {
                variant: 'outline',
                onClick: handleCancel,
              },

              cancelText
            ),
            Button(
              {
                color: 'primary',
                variant: 'filled',
                onClick: handleConfirm,
              },

              confirmText
            )
          ),
        })
      }

      return fn(open, close)
    }
  )
}
