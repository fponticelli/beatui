import { useAnimatedElementToggle } from '../../utils'
import {
  attr,
  computedOf,
  Fragment,
  OnDispose,
  prop,
  TNode,
  Value,
  WithElement,
} from '@tempots/dom'
import { ElementRect } from '@tempots/ui'

/** Configuration options for the {@link Collapse} component. */
export type CollapseOption = {
  /** Reactive boolean controlling whether the content is expanded or collapsed. */
  open: Value<boolean>
}

/**
 * Animated collapsible container that smoothly expands and contracts its content.
 * Measures the natural content height and uses CSS transitions for smooth animation.
 *
 * The component manages four animation states internally: `closed`, `start-opening`,
 * `opened`, and `start-closing`, applying corresponding CSS classes for each.
 *
 * @param options - Configuration with the `open` signal controlling visibility
 * @param children - Content to show/hide with animation
 * @returns A container element with animated collapse behavior
 *
 * @example
 * ```typescript
 * import { prop } from '@tempots/dom'
 *
 * const isOpen = prop(false)
 *
 * Stack(
 *   Button({ onClick: () => isOpen.set(!isOpen.value) }, 'Toggle'),
 *   Collapse(
 *     { open: isOpen },
 *     html.p('This content is collapsible.')
 *   )
 * )
 * ```
 */
export function Collapse({ open }: CollapseOption, ...children: TNode[]) {
  return WithElement(element => {
    const { status, setOpen, dispose } = useAnimatedElementToggle({
      initialStatus: Value.get(open) ? 'opened' : 'closed',
      element,
    })
    Value.on(open, setOpen)

    return ElementRect(rect => {
      const height = prop<null | number>(null)

      // Track the natural height of the content
      const settableHeight = computedOf(
        status,
        rect.$.height
      )((status, rectHeight) => {
        // Capture height when element is in opened state
        if (status === 'opened' && rectHeight > 0) {
          return rectHeight
        }
        return null
      })

      settableHeight.on(v => {
        if (v != null) {
          height.set(v)
        }
      })

      // Handle the transition states with proper height management
      status.on(currentStatus => {
        if (!element) return

        if (currentStatus === 'start-opening') {
          // For start-opening, we need to measure the height first
          // Temporarily allow the element to expand to measure its height
          const originalHeight = element.style.height
          const originalTransition = element.style.transition

          element.style.transition = 'none'
          element.style.height = 'auto'

          // Force reflow and measure
          void element.offsetHeight
          const measuredHeight = element.scrollHeight

          if (measuredHeight > 0) {
            height.set(measuredHeight)
          }

          // Restore original styles
          element.style.height = originalHeight
          element.style.transition = originalTransition

          // Force reflow to ensure styles are applied
          void element.offsetHeight
        }
      })

      return Fragment(
        OnDispose(dispose),
        attr.style(
          height.map(h => `--collapse-height: ${h != null ? `${h}px` : 'auto'}`)
        ),
        attr.class(status.map(s => `bc-collapse bc-collapse--${s}`)),
        ...children
      )
    })
  })
}
