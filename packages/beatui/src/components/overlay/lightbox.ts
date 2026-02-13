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
} from '@tempots/dom'
import { Overlay } from './overlay'
import { OverlayEffect } from '../theme'
import { CloseButton } from '../button'
import { BeatUII18n } from '../../beatui-i18n'

/**
 * Configuration options for the {@link Lightbox} component.
 */
export interface LightboxOptions {
  /**
   * Whether the lightbox can be closed by clicking outside or pressing the Escape key.
   * When `false`, the overlay ignores dismiss gestures.
   * @default true
   */
  dismissable?: Value<boolean>
  /**
   * Whether to show a close button in the top-end corner of the lightbox.
   * @default true
   */
  showCloseButton?: Value<boolean>
  /**
   * Visual effect applied to the overlay backdrop behind the lightbox.
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
   * Padding in pixels kept around the content. The content is constrained to the
   * viewport dimensions minus this padding on each side.
   * @default 32
   */
  padding?: Value<number>
}

/**
 * Lightbox overlay for displaying arbitrary content maximized and centered over a dark backdrop.
 *
 * The lightbox attaches via a portal to the document body by default, fades in/out using
 * the overlay's animated toggle, and constrains content to the viewport dimensions minus
 * configurable padding. Overflow is clipped without transform scaling.
 *
 * Built on top of {@link Overlay}.
 *
 * @param options - Configuration options controlling dismissability, close button, overlay effect, and padding
 * @param fn - A render function that receives `open` and `close` callbacks and returns the trigger content.
 *   Call `open(content)` with a `TNode` to display the lightbox content.
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * Lightbox(
 *   { dismissable: true, padding: 48 },
 *   (open, close) => html.img(
 *     attr.src('/thumb.jpg'),
 *     attr.alt('Thumbnail'),
 *     on.click(() => open(
 *       html.img(attr.src('/full-size.jpg'), attr.alt('Full size image'))
 *     ))
 *   )
 * )
 * ```
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
        content: lightboxContent,
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
