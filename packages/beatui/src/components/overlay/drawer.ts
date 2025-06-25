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
} from '@tempots/dom'
import { Button } from '../button'
import { Icon } from '../data'
import { Overlay } from './overlay'
import { OverlayEffect } from '../theme/types'
import { ScrollablePanel } from '../layout'

export interface DrawerOptions {
  /** Size of the drawer */
  size?: Value<'sm' | 'md' | 'lg' | 'xl'>
  /** Side of the viewport/element to anchor the drawer to */
  side?: Value<'top' | 'right' | 'bottom' | 'left'>
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
    let currentClose: () => void = () => {}

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

      const drawerContent = html.div(
        attr.class(
          computedOf(
            size,
            side
          )(
            (s, sd) =>
              `bc-drawer bc-drawer--size-${s} bc-drawer--container-${container} bc-drawer--side-${sd}`
          )
        ),
        on.mousedown(e => e.stopPropagation()), // Prevent overlay click-outside when clicking drawer content

        // Drawer content container
        MapSignal(displayHeader, display => {
          if (display) {
            return ScrollablePanel({
              header: html.div(
                attr.class('bc-drawer__header'),
                html.div(header),
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
                    Icon({ icon: 'line-md:close', size: 'sm' })
                  )
                )
              ),
              body: html.div(attr.class('bc-drawer__body'), body),
              footer:
                footer && html.div(attr.class('bc-drawer__footer'), footer),
            })
          } else {
            return ScrollablePanel({
              body: html.div(attr.class('bc-drawer__body'), body),
              footer:
                footer && html.div(attr.class('bc-drawer__footer'), footer),
            })
          }
        })
      )

      openOverlay({
        mode,
        effect: (overlayEffect ?? 'opaque') as Value<OverlayEffect> | undefined,
        container,
        content: drawerContent,
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
