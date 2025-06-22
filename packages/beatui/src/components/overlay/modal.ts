import { attr, html, TNode, Value, on, prop } from '@tempots/dom'
import { OverlayBody, OverlayElement, OverlayOptions } from './overlay'
import { Button } from '../button'
import { Icon } from '../data/icon'

export interface ModalOptions {
  /** Size of the modal */
  size?: Value<'sm' | 'md' | 'lg' | 'xl'>
  /** Whether the modal can be closed by clicking outside or pressing escape */
  closable?: Value<boolean>
  /** Whether to show the close button in header (only applies if header is provided) */
  showCloseButton?: Value<boolean>
  /** Callback when modal is closed */
  onClose?: () => void
  /** Overlay effect */
  effect?: Value<'transparent' | 'visible'>
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
    closable = true,
    showCloseButton = true,
    onClose,
    effect = 'visible',
    container = 'body',
  } = options

  // Create a reactive mode signal based on closable
  const mode = prop<'capturing' | 'non-capturing'>('capturing')

  // Update mode when closable changes
  Value.on(closable, isClosable => {
    mode.set(isClosable ? 'capturing' : 'non-capturing')
  })

  const overlayOptions: OverlayOptions = {
    mode,
    effect,
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
      openOverlay(close => {
        currentClose = close

        // Add close button to header if header is provided and showCloseButton is true
        const headerWithCloseButton = content.header
          ? addCloseButtonToHeader(content.header, showCloseButton, close)
          : content.header

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
            headerWithCloseButton,

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
 * Helper function to add close button to header if showCloseButton is true
 */
function addCloseButtonToHeader(
  header: TNode,
  showCloseButton: Value<boolean>,
  onClose: () => void
): TNode {
  // If showCloseButton is false, return header as-is
  if (!Value.get(showCloseButton)) {
    return header
  }

  // Create close button
  const closeButton = Button(
    {
      variant: 'text',
      size: 'sm',
      onClick: onClose,
    },
    Icon({ icon: 'mdi:close', size: 'sm' })
  )

  // If header is a div with bc-modal__header class, add close button to it
  // Otherwise, wrap header in a div with the close button
  return html.div(attr.class('bc-modal__header-wrapper'), header, closeButton)
}

/**
 * Convenience function to create a simple modal with just body content
 */
export function SimpleModal(
  options: ModalOptions & { body: TNode },
  fn: (open: () => void, close: () => void) => TNode
): TNode {
  const { body, ...modalOptions } = options

  return Modal(modalOptions, (openModal, close) => {
    const open = () => {
      openModal({ body })
    }

    return fn(open, close)
  })
}

/**
 * Convenience function to create a confirmation modal
 */
export function ConfirmModal(
  options: ModalOptions & {
    message: Value<string>
    confirmText?: Value<string>
    cancelText?: Value<string>
    onConfirm?: () => void
    onCancel?: () => void
  },
  fn: (open: () => void, close: () => void) => TNode
): TNode {
  const {
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    ...modalOptions
  } = options

  return Modal(modalOptions, (openModal, close) => {
    const handleConfirm = () => {
      onConfirm?.()
      close()
    }

    const handleCancel = () => {
      onCancel?.()
      close()
    }

    const open = () => {
      openModal({
        body: html.p(attr.class('bc-modal__message'), message),
        footer: html.div(
          attr.class('bc-modal__actions'),
          Button(
            {
              variant: 'outline',
              onClick: handleCancel,
            },
            cancelText
          ),
          Button(
            {
              variant: 'filled',
              onClick: handleConfirm,
            },
            confirmText
          )
        ),
      })
    }

    return fn(open, close)
  })
}
