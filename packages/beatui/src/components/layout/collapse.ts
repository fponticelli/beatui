import { useAnimatedElementToggle } from '@/utils'
import {
  attr,
  computedOf,
  Fragment,
  OnDispose,
  prop,
  style,
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
      const settableHeight = computedOf(
        status,
        rect.$.height
      )((status, height) => {
        if (status === 'opened' && height > 0) {
          return height
        }
        return null
      })
      settableHeight.on(v => {
        if (v != null) {
          height.set(v)
        }
      })
      return Fragment(
        OnDispose(dispose),
        OnDispose(height.dispose),
        style.height(
          computedOf(
            status,
            height
          )((status, height) => {
            if (
              status === 'opened' ||
              status === 'opening' ||
              status === 'start-closing'
            ) {
              return `${height}px`
            }
            return null
          })
        ),
        attr.class(status.map(s => `bc-collapse bc-collapse--${s}`)),
        ...children
      )
    })
  })
}
