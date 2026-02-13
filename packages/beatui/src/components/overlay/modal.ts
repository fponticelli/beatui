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
  Use,
  coalesce,
  Renderable,
} from '@tempots/dom'
import { Overlay } from './overlay'
import { Button, CloseButton } from '../button'
import { OverlayEffect } from '../theme'
import { FocusTrap } from '../../utils/focus-trap'
import { sessionId } from '../../utils/session-id'
import { BeatUII18n } from '../../beatui-i18n'

/**
 * Configuration options for the {@link Modal} component.
 */
export interface ModalOptions {
  /**
   * Size preset controlling the maximum width of the modal dialog.
   * @default 'md'
   */
  size?: Value<'sm' | 'md' | 'lg' | 'xl'>
  /**
   * Whether the modal can be closed by clicking outside or pressing the Escape key.
   * When `false`, the overlay enters non-capturing mode and ignores dismiss gestures.
   * @default true
   */
  dismissable?: Value<boolean>
  /**
   * Whether to show the close button in the modal header.
   * Only rendered when header content is provided.
   * @default true
   */
  showCloseButton?: Value<boolean>
  /**
   * Callback invoked when the modal is closed via dismiss gestures (click outside or Escape).
   */
  onClose?: () => void
  /**
   * Visual effect applied to the overlay backdrop behind the modal.
   * @default 'opaque'
   */
  overlayEffect?: Value<OverlayEffect>
  /**
   * Where to attach the overlay in the DOM.
   * - `'body'` - Renders via a portal to the document body.
   * - `'element'` - Renders as a child of the current element context.
   * @default 'body'
   */
  container?: 'body' | 'element'
  /**
   * Position of the modal dialog within the overlay.
   * Controls alignment relative to the viewport or container.
   * @default 'center'
   */
  position?: Value<
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
  >
}

/**
 * Content layout options for a modal dialog, defining the header, body, and footer sections.
 */
export interface ModalContentOptions {
  /**
   * Optional header content displayed at the top of the modal.
   * When provided, an ARIA `labelledby` association is created for accessibility.
   */
  header?: TNode
  /**
   * Main body content of the modal dialog. This section is always rendered
   * and is referenced via ARIA `describedby` for screen readers.
   */
  body: TNode
  /**
   * Optional footer content, typically used for action buttons (e.g., confirm, cancel).
   */
  footer?: TNode
}

/**
 * Modal dialog component with structured header, body, and footer sections.
 *
 * Built on top of {@link Overlay}, it provides focus trapping, keyboard dismissal,
 * click-outside dismissal, and proper ARIA attributes (`role="dialog"`, `aria-modal`,
 * `aria-labelledby`, `aria-describedby`).
 *
 * @param options - Configuration options controlling size, position, dismissability, and overlay effect
 * @param fn - A render function that receives `open` and `close` callbacks and returns the trigger content.
 *   Call `open(content)` with a {@link ModalContentOptions} object to display the modal.
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * const isOpen = prop(false)
 *
 * Modal(
 *   { size: 'lg', dismissable: true, onClose: () => isOpen.set(false) },
 *   (open, close) => Button(
 *     { onClick: () => open({
 *       header: html.h2('Confirm Action'),
 *       body: html.p('Are you sure you want to proceed?'),
 *       footer: Fragment(
 *         Button({ variant: 'outline', onClick: close }, 'Cancel'),
 *         Button({ color: 'primary', variant: 'filled', onClick: close }, 'OK')
 *       ),
 *     })},
 *     'Open Modal'
 *   )
 * )
 * ```
 */
export function Modal(
  options: ModalOptions,
  fn: (open: (content: ModalContentOptions) => void, close: () => void) => TNode
): Renderable {
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
      const modalId = sessionId('modal')
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
          escapeDeactivates: false, // Let Overlay handle escape key
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
                attr.class('bc-modal__title'),
                ...(content.header ? [attr.id(headerId)] : []),
                content.header
              ),
              When(showCloseButton, () =>
                Use(BeatUII18n, t =>
                  CloseButton({
                    size: 'sm',
                    label: t.$.closeModal,
                    onClick: () => {
                      currentClose()
                      closeOverlay()
                    },
                  })
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
 * Convenience wrapper around {@link Modal} that provides a pre-built confirmation dialog
 * with configurable confirm and cancel buttons.
 *
 * The modal automatically includes localized button labels (via {@link BeatUII18n}) and
 * hides the header close button by default.
 *
 * @param options - Combined {@link ModalOptions} plus confirmation-specific settings:
 * @param options.confirmText - Custom label for the confirm button. Falls back to the i18n `confirm` string.
 * @param options.cancelText - Custom label for the cancel button. Falls back to the i18n `cancel` string.
 * @param options.onConfirm - Callback invoked when the user clicks the confirm button.
 * @param options.onCancel - Callback invoked when the user clicks the cancel button.
 * @param fn - A render function that receives `open` and `close` callbacks and returns the trigger content.
 *   Call `open(message)` with a `TNode` to display the confirmation message.
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * ConfirmModal(
 *   {
 *     onConfirm: () => console.log('Confirmed'),
 *     onCancel: () => console.log('Cancelled'),
 *     confirmText: 'Delete',
 *     cancelText: 'Keep',
 *   },
 *   (open, close) => Button(
 *     { onClick: () => open(html.p('Delete this item permanently?')) },
 *     'Delete Item'
 *   )
 * )
 * ```
 */
export function ConfirmModal(
  options: ModalOptions & {
    /** Custom label for the confirm button. Falls back to the i18n `confirm` string. */
    confirmText?: Value<string>
    /** Custom label for the cancel button. Falls back to the i18n `cancel` string. */
    cancelText?: Value<string>
    /** Callback invoked when the user clicks the confirm button. */
    onConfirm?: () => void
    /** Callback invoked when the user clicks the cancel button. */
    onCancel?: () => void
  },
  fn: (open: (message: TNode) => void, close: () => void) => TNode
): Renderable {
  const { confirmText, cancelText, onConfirm, onCancel, ...modalOptions } =
    options

  return Use(BeatUII18n, t =>
    Modal({ showCloseButton: false, ...modalOptions }, (openModal, close) => {
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
            attr.class('bc-modal__actions'),
            Button(
              {
                variant: 'outline',
                onClick: handleCancel,
              },
              coalesce(cancelText, t.$.cancel)
            ),
            Button(
              {
                color: 'primary',
                variant: 'filled',
                onClick: handleConfirm,
              },
              coalesce(confirmText, t.$.confirm)
            )
          ),
        })
      }

      return fn(open, close)
    })
  )
}
