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
} from '@tempots/dom'
import { OverlayBody, OverlayElement, OverlayOptions } from './overlay'
import { Button } from '../button'
import { Icon } from '../data/icon'
import { OverlayEffect } from '../theme'

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
  overlayEffect?: Value<'transparent' | 'opaque'>
  /** Container for the overlay: 'body' (default) or 'element' (current element) */
  container?: 'body' | 'element'
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
  } = options

  // Create a reactive mode signal based on dismissable
  const mode = prop<'capturing' | 'non-capturing'>('capturing')

  // Update mode when dismissable changes
  Value.on(dismissable, isDismissable => {
    mode.set(isDismissable ? 'capturing' : 'non-capturing')
  })

  const overlayOptions: OverlayOptions = {
    mode,
    effect: (overlayEffect ?? 'opaque') as Value<OverlayEffect> | undefined,
    onClickOutside: () => {
      onClose?.()
    },
    onEscape: () => {
      onClose?.()
    },
  }

  const OverlayComponent = container === 'body' ? OverlayBody : OverlayElement

  return OverlayComponent(overlayOptions, openOverlay => {
    let currentClose: () => void = () => {}

    const open = (content: ModalContentOptions) => {
      const displayHeader = computedOf(
        content.header != null,
        showCloseButton
      )((header, showCloseButton) => {
        return header || showCloseButton
      })
      openOverlay(close => {
        currentClose = close

        return html.div(
          attr.class(
            Value.map(
              size,
              s =>
                `bc-modal bc-modal--size-${s} bc-modal--container-${container}`
            )
          ),
          on.mousedown(e => e.stopPropagation()), // Prevent overlay click-outside when clicking modal content

          // Modal content container
          html.div(
            attr.class('bc-modal__content'),

            // Header section
            When(displayHeader, () =>
              html.div(
                attr.class('bc-modal__header'),
                html.div(content.header),
                When(showCloseButton, () =>
                  Button(
                    {
                      variant: 'text',
                      size: 'sm',
                      onClick: currentClose,
                    },
                    Icon({ icon: 'mdi:close', size: 'sm' })
                  )
                )
              )
            ),

            // Body section
            html.div(attr.class('bc-modal__body'), content.body),

            // Footer section
            content.footer &&
              html.div(attr.class('bc-modal__footer'), content.footer)
          )
        )
      })
    }

    const close = () => {
      currentClose()
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
    confirmText = 'Confirm',
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
