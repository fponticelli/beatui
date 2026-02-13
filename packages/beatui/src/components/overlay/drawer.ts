import {
  attr,
  computedOf,
  html,
  on,
  prop,
  TNode,
  Renderable,
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
import { useAnimatedElementToggle } from '../../utils/use-animated-toggle'
import { FocusTrap } from '../../utils/focus-trap'
import { sessionId } from '../../utils/session-id'
import { BeatUII18n } from '../../beatui-i18n'

/**
 * Configuration options for the {@link Drawer} component, defining its content layout
 * and behavioral properties.
 */
export interface DrawerOptions {
  /**
   * Size preset controlling the width (for left/right drawers) or height (for top/bottom drawers).
   * @default 'md'
   */
  size?: Value<'sm' | 'md' | 'lg' | 'xl'>
  /**
   * Side of the viewport or container element to anchor the drawer to.
   * Logical values `'inline-start'` and `'inline-end'` respect the document's writing direction.
   * @default 'right'
   */
  side?: Value<
    'top' | 'right' | 'bottom' | 'left' | 'inline-start' | 'inline-end'
  >
  /**
   * Whether the drawer can be closed by clicking outside or pressing the Escape key.
   * When `false`, the overlay enters non-capturing mode and ignores dismiss gestures.
   * @default true
   */
  dismissable?: Value<boolean>
  /**
   * Whether to show the close button in the drawer header.
   * Only rendered when header content is provided.
   * @default true
   */
  showCloseButton?: Value<boolean>
  /**
   * Callback invoked when the drawer is closed via dismiss gestures (click outside or Escape).
   */
  onClose?: () => void
  /**
   * Visual effect applied to the overlay backdrop behind the drawer.
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
   * Optional header content displayed at the top of the drawer panel.
   * When provided alongside `showCloseButton`, a close button is rendered in the header.
   */
  header?: TNode
  /**
   * Main body content of the drawer. Rendered inside a scrollable panel.
   */
  body: TNode
  /**
   * Optional footer content, typically used for action buttons at the bottom of the drawer.
   */
  footer?: TNode
}

/**
 * Slide-out panel component that anchors to any side of the viewport or container.
 *
 * Built on top of {@link Overlay}, the Drawer provides animated open/close transitions,
 * focus trapping, keyboard and click-outside dismissal, and proper ARIA attributes
 * (`role="dialog"`, `aria-modal`). The body content is rendered inside a
 * {@link ScrollablePanel} for built-in scrolling behavior.
 *
 * @param fn - A render function that receives `open` and `close` callbacks and returns the trigger content.
 *   Call `open(options)` with a {@link DrawerOptions} object to display the drawer.
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * Drawer((open, close) =>
 *   Button(
 *     { onClick: () => open({
 *       side: 'right',
 *       size: 'md',
 *       header: html.h3('Settings'),
 *       body: html.div(
 *         html.p('Drawer body content here'),
 *         FormField({ label: 'Name' }, TextInput({ value: prop('') }))
 *       ),
 *       footer: Button({ variant: 'filled', onClick: close }, 'Save'),
 *       onClose: () => console.log('Drawer closed'),
 *     })},
 *     'Open Drawer'
 *   )
 * )
 * ```
 */
export function Drawer(
  fn: (open: (options: DrawerOptions) => void, close: () => void) => TNode
): Renderable {
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

        // Wait for animation to complete before actually closing overlay
        animatedToggle.listenOnClosed(() => {
          closeOverlay()
        })

        // Create a close function that handles animation
        const closeWithAnimation = () => {
          animatedToggle.close()
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
          When(
            displayHeader,
            () =>
              ScrollablePanel({
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
              }),
            () =>
              ScrollablePanel({
                body: html.div(
                  attr.class('bc-drawer__body'),
                  attr.id(bodyId),
                  body
                ),
                footer:
                  footer && html.div(attr.class('bc-drawer__footer'), footer),
              })
          )
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
