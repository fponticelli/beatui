import {
  attr,
  BrowserContext,
  computedOf,
  dataAttr,
  html,
  render,
  TNode,
  Value,
  WithBrowserCtx,
  WithElement,
} from '@tempots/dom'
import { OverlayEffect } from '../theme/types'
import { useAnimatedElementToggle } from '../../utils/use-animated-toggle'
import { delayedAnimationFrame } from '@tempots/std'

/**
 * Configuration options for the Overlay component.
 */
export type OverlayOptions = {
  /**
   * Visual effect applied to the overlay backdrop.
   * @default 'opaque'
   */
  effect?: Value<OverlayEffect>
  /**
   * Interaction mode for the overlay.
   * - `'capturing'` - Listens for Escape key presses and click-outside events to close the overlay.
   * - `'non-capturing'` - Does not register any close event listeners, making the overlay non-dismissable via user interaction.
   * @default 'capturing'
   */
  mode?: Value<'capturing' | 'non-capturing'>
  /**
   * Callback invoked when the user clicks outside the overlay content area.
   * Only fires when `mode` is `'capturing'`.
   */
  onClickOutside?: () => void
  /**
   * Callback invoked when the user presses the Escape key.
   * Only fires when `mode` is `'capturing'`.
   */
  onEscape?: () => void
  /**
   * Content to render inside the overlay.
   */
  content?: TNode
  /**
   * Where to attach the overlay in the DOM.
   * - `'body'` - Renders via a portal to the document body.
   * - `'element'` - Renders as a child of the current element context.
   * @default 'body'
   */
  container?: 'body' | 'element'
}

/**
 * Low-level overlay primitive that manages a full-screen backdrop with animated open/close transitions.
 *
 * The overlay handles event delegation (Escape key, click-outside), inerts sibling elements
 * for accessibility, and supports portal rendering to the document body.
 *
 * Higher-level components such as {@link Modal}, {@link Drawer}, and {@link Lightbox} are built
 * on top of this primitive.
 *
 * @param fn - A render function that receives `open` and `close` callbacks and returns the trigger content.
 *   Call `open(options)` to display the overlay and `close()` to dismiss it.
 * @returns A renderable node
 *
 * @example
 * ```typescript
 * Overlay((open, close) => {
 *   return Button(
 *     { onClick: () => open({
 *       effect: 'opaque',
 *       content: html.div(
 *         html.p('Overlay content'),
 *         Button({ onClick: close }, 'Close')
 *       ),
 *       onEscape: close,
 *       onClickOutside: close,
 *     })},
 *     'Open Overlay'
 *   )
 * })
 * ```
 */
export function Overlay(
  fn: (open: (options: OverlayOptions) => void, close: () => void) => TNode
) {
  return WithBrowserCtx(ctx => {
    const disposables: (() => void)[] = []
    const close = () => disposables.forEach(dispose => dispose())

    const open = ({
      effect = 'opaque',
      mode = 'capturing',
      onClickOutside,
      onEscape,
      content,
      container = 'body',
    }: OverlayOptions) => {
      if (container === 'body') {
        ctx = ctx.makePortal('body') as BrowserContext
      }
      const status = useAnimatedElementToggle()
      status.listenOnClosed(close)

      // Event listener cleanup functions
      let escapeCleanup: () => void = () => {}
      let clickOutsideCleanup: () => void = () => {}

      // Setup escape key listener
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onEscape?.()
          status.close()
        }
      }

      // Setup click outside listener
      const handleClickOutside = () => {
        onClickOutside?.()
        status.close()
      }

      const setupEventListeners = (
        currentMode: 'capturing' | 'non-capturing'
      ) => {
        // Clean up existing listeners
        escapeCleanup()
        clickOutsideCleanup()

        if (currentMode === 'capturing') {
          document.addEventListener('keydown', handleEscape)
          escapeCleanup = () =>
            document.removeEventListener('keydown', handleEscape)
          ctx.element.addEventListener('mousedown', handleClickOutside)
          clickOutsideCleanup = () =>
            ctx.element.removeEventListener('mousedown', handleClickOutside)
        } else {
          escapeCleanup = () => {}
          clickOutsideCleanup = () => {}
        }
      }

      // Listen for mode changes and update event listeners
      const modeCleanup = Value.on(mode, setupEventListeners)
      disposables.push(modeCleanup)

      // Cleanup event listeners when overlay is disposed
      disposables.push(() => {
        status.dispose()
        escapeCleanup()
        clickOutsideCleanup()
      })

      const makeContainer = () => {
        const inertChildren = new Set<Element>()
        for (const el of ctx.element.querySelectorAll(
          ':scope > :not([data-overlay])'
        )) {
          if (el.hasAttribute('inert')) {
            inertChildren.add(el)
          } else {
            el.setAttribute('inert', '')
          }
        }
        disposables.push(() => {
          for (const el of ctx.element.querySelectorAll(
            ':scope > :not([data-overlay])'
          )) {
            if (!inertChildren.has(el)) {
              el.removeAttribute('inert')
            }
          }
          inertChildren.clear()
        })
        ;(document.activeElement as HTMLElement)?.blur?.()

        return html.div(
          WithElement(el => status.setElement(el)),
          dataAttr.status(status.status.map(String)),
          dataAttr.overlay('true'),
          attr.class(
            computedOf(
              effect ?? 'opaque',
              mode
            )(
              (effect, mode) =>
                `bc-overlay bc-overlay--effect-${effect} bc-overlay--mode-${mode}`
            )
          ),
          content
        )
      }

      const clear = render(makeContainer(), ctx.element, {
        disposeWithParent: true,
        clear: false,
        providers: ctx.providers,
      })
      disposables.push(clear)
      delayedAnimationFrame(() => status.open())
    }

    return fn(open, close)
  })
}
