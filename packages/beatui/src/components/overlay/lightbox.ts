import {
  Renderable,
  Value,
  TNode,
  html,
  attr,
  prop,
  computedOf,
  Use,
  When,
  Fragment,
  OnDispose,
} from '@tempots/dom'
import { Overlay } from './overlay'
import { OverlayEffect } from '../theme'
import { CloseButton } from '../button'
import { BeatUII18n } from '@/beatui-i18n'

export interface LightboxOptions {
  /** Whether clicking outside/Escape closes the lightbox (default: true) */
  dismissable?: Value<boolean>
  /** Whether to show the close button in the top-end corner (default: true) */
  showCloseButton?: Value<boolean>
  /** Overlay effect (default: 'opaque') */
  overlayEffect?: Value<OverlayEffect>
  /** Container for the overlay: 'body' (default) or 'element' */
  container?: 'body' | 'element'
  /** Padding (in px) kept around content; content is capped by viewport minus padding (default: 32) */
  padding?: Value<number>
}

/**
 * Lightbox overlay for displaying arbitrary content maximized and centered.
 * - Attaches via Portal to body by default
 * - Dark background via Overlay effect
 * - Fades in/out using the overlay's animated toggle
 * - Caps content to viewport (minus padding) and clips overflow; no transform scaling
 */
export function Lightbox(
  options: LightboxOptions,
  fn: (open: (content: TNode) => void, close: () => void) => TNode
): Renderable {
  const {
    dismissable = true,
    showCloseButton = true,
    overlayEffect = 'opaque',
    container = 'body',
    padding = 32,
  } = options

  return Overlay((openOverlay, closeOverlay) => {
    let currentClose: () => void = () => {}

    const open = (content: TNode) => {
      currentClose = closeOverlay

      // mode reacts to dismissable
      // eslint-disable-next-line tempots/require-signal-disposal
      const mode = prop<'capturing' | 'non-capturing'>(
        (typeof dismissable === 'boolean' ? dismissable : true)
          ? 'capturing'
          : 'non-capturing'
      )

      // track current dismissable value and update mode when it changes
      let currentDismissable =
        typeof dismissable === 'boolean' ? dismissable : true
      Value.on(dismissable as Value<boolean>, isDismissable => {
        currentDismissable = isDismissable
        mode.set(isDismissable ? 'capturing' : 'non-capturing')
      })

      const lightboxContent = html.div(
        attr.class('bc-lightbox'),

        // Close button (top-end)
        When(
          showCloseButton as Value<boolean>,
          () =>
            Use(BeatUII18n, t =>
              html.div(
                attr.class('bc-lightbox__close'),
                CloseButton({
                  size: 'md',
                  label: t.$.closeModal,
                  onClick: () => {
                    currentClose()
                    closeOverlay()
                  },
                })
              )
            ),
          () => null
        ),

        // Viewport (centering + padding)
        html.div(
          attr.class('bc-lightbox__viewport'),
          // Visual padding applied here
          attr.style(
            computedOf(padding)(
              pad => `padding:${typeof pad === 'number' ? pad + 'px' : pad}`
            )
          ),

          // Content wrapper capped by viewport; overflow is clipped
          html.div(attr.class('bc-lightbox__content'), content)
        )
      )

      openOverlay({
        mode,
        effect: (overlayEffect ?? 'opaque') as Value<OverlayEffect> | undefined,
        container,
        content: Fragment(OnDispose(mode), lightboxContent),
        onClickOutside: () => {
          // only close if dismissable
          if (currentDismissable) {
            currentClose()
            closeOverlay()
          }
        },
        onEscape: () => {
          if (currentDismissable) {
            currentClose()
            closeOverlay()
          }
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
