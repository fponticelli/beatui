import {
  attr,
  computedOf,
  html,
  MapSignal,
  on,
  prop,
  TNode,
  Value,
  When,
  WithElement,
  aria,
  dataAttr,
  Use,
} from '@tempots/dom'
import { delayedAnimationFrame } from '@tempots/std'
import { CloseButton } from '../button'
import { Overlay } from './overlay'
import { OverlayEffect } from '../theme/types'
import { ScrollablePanel } from '../layout'
import { useAnimatedElementToggle } from '@/utils/use-animated-toggle'
import { FocusTrap } from '@/utils/focus-trap'
import { sessionId } from '../../utils/session-id'
import { BeatUII18n } from '@/beatui-i18n'

export interface DrawerOptions {
  /** Size of the drawer */
  size?: Value<'sm' | 'md' | 'lg' | 'xl'>
  /** Side of the viewport/element to anchor the drawer to */
  side?: Value<
    'top' | 'right' | 'bottom' | 'left' | 'inline-start' | 'inline-end'
  >
  /** Whether the drawer can be closed by clicking outside or pressing escape */
  dismissable?: Value<boolean>
  /** Whether to show the close button in header (only applies if header is provided) */
  showCloseButton?: Value<boolean>
  /** Callback when drawer is closed */
  onClose?: () => void
  /** Overlay effect */
  overlayEffect?: Value<OverlayEffect>
  /** Container for the overlay: 'body' (default) or 'element' (current element) */
  container?: 'body' | 'element'
  /** Header content for the drawer */
  header?: TNode
  /** Body content for the drawer */
  body: TNode
  /** Footer content for the drawer */
  footer?: TNode
}

/**
 * Drawer component that provides a slide-out panel anchored to any side
 * Built on top of the overlay component
 */
export function Drawer(
  fn: (open: (options: DrawerOptions) => void, close: () => void) => TNode
): TNode {
  return Overlay((openOverlay, closeOverlay) => {
    let currentClose: () => void = closeOverlay

    // Create a wrapper function that always calls the current close function
    const handleClose = () => currentClose()

    const open = (options: DrawerOptions) => {
      const {
        size = 'md',
        side = 'right',
        dismissable = true,
        showCloseButton = true,
        onClose,
        overlayEffect = 'opaque',
        container = 'body',
        header,
        body,
        footer,
      } = options
      currentClose = closeOverlay

      // Create a reactive mode signal based on dismissable
      const mode = prop<'capturing' | 'non-capturing'>('capturing')

      // Update mode when dismissable changes
      Value.on(dismissable, isDismissable => {
        mode.set(isDismissable ? 'capturing' : 'non-capturing')
      })

      const displayHeader = computedOf(
        header != null,
        showCloseButton
      )((header, showCloseButton) => {
        return header || showCloseButton
      })

      const drawerContent = WithElement(element => {
        const animatedToggle = useAnimatedElementToggle({
          initialStatus: 'closed',
          element,
        })

        // Create a close function that handles animation
        const closeWithAnimation = () => {
          animatedToggle.close()
          // Wait for animation to complete before actually closing overlay
          animatedToggle.onClosed(() => {
            closeOverlay()
          })
        }

        // Update the current close function
        currentClose = closeWithAnimation

        // Start the opening animation after the element is in the DOM
        // Use a small delay to ensure the closed state is rendered first
        delayedAnimationFrame(() => animatedToggle.open())

        // Generate unique IDs for accessibility
        const drawerId = sessionId('drawer')
        const headerContentId =
          header != null ? `${drawerId}-header` : undefined
        const bodyId = `${drawerId}-body`

        return html.div(
          attr.class(
            computedOf(
              size,
              side,
              animatedToggle.status
            )(
              (s, sd, status) =>
                `bc-drawer bc-drawer--size-${s} bc-drawer--container-${container} bc-drawer--side-${sd} bc-drawer--status-${status}`
            )
          ),
          // Essential ARIA attributes for drawer dialog
          attr.role('dialog'),
          aria.modal(true),
          ...(headerContentId ? [aria.labelledby(headerContentId)] : []),
          aria.describedby(bodyId),
          attr.tabindex(-1), // Make drawer focusable for initial focus
          attr.id(drawerId),
          dataAttr.focusTrap('true'), // Mark as focus trap container

          // Focus trap for keyboard navigation
          FocusTrap({
            active: true,
            escapeDeactivates: false, // Let Overlay handle escape key
            initialFocus: () => {
              // Focus close button if available, otherwise first focusable element
              const closeButton = document.querySelector(
                `#${drawerId} [aria-label="Close drawer"]`
              ) as HTMLElement
              return closeButton || null
            },
          }),

          on.mousedown(e => e.stopPropagation()), // Prevent overlay click-outside when clicking drawer content

          // Drawer content container
          MapSignal(displayHeader, display => {
            if (display) {
              return ScrollablePanel({
                header: html.div(
                  attr.class('bc-drawer__header'),
                  html.div(attr.id(headerContentId!), header),
                  When(showCloseButton, () =>
                    Use(BeatUII18n, t =>
                      CloseButton({
                        size: 'sm',
                        onClick: handleClose,
                        label: t.$.closeDrawer,
                      })
                    )
                  )
                ),
                body: html.div(
                  attr.class('bc-drawer__body'),
                  attr.id(bodyId),
                  body
                ),
                footer:
                  footer && html.div(attr.class('bc-drawer__footer'), footer),
              })
            } else {
              return ScrollablePanel({
                body: html.div(
                  attr.class('bc-drawer__body'),
                  attr.id(bodyId),
                  body
                ),
                footer:
                  footer && html.div(attr.class('bc-drawer__footer'), footer),
              })
            }
          })
        )
      })

      openOverlay({
        mode,
        effect: (overlayEffect ?? 'opaque') as Value<OverlayEffect> | undefined,
        container,
        content: drawerContent,
        onClickOutside: () => {
          onClose?.()
          handleClose()
        },
        onEscape: () => {
          onClose?.()
          handleClose()
        },
      })
    }

    const close = () => {
      handleClose()
    }

    return fn(open, close)
  })
}
