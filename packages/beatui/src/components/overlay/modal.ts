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
  dataAttr,
} from '@tempots/dom'
import { Overlay } from './overlay'
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
        dataAttr.dismissable(Value.map(dismissable, String)),
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
                    onClick: () => {
                      currentClose()
                      closeOverlay()
                    },
                  },
                  dataAttr.close('true'),
                  Icon({ icon: 'line-md:close', size: 'sm' })
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
              dataAttr.cancel('true'),
              cancelText
            ),
            Button(
              {
                color: 'primary',
                variant: 'filled',
                onClick: handleConfirm,
              },
              dataAttr.confirm('true'),
              confirmText
            )
          ),
        })
      }

      return fn(open, close)
    }
  )
}
