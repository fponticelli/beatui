import { useAnimatedElementToggle } from '@/utils'
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

export type CollapseOption = {
  open: Value<boolean>
}

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
        OnDispose(height.dispose),
        attr.style(
          height.map(h => `--collapse-height: ${h != null ? `${h}px` : 'auto'}`)
        ),
        attr.class(status.map(s => `bc-collapse bc-collapse--${s}`)),
        ...children
      )
    })
  })
}
