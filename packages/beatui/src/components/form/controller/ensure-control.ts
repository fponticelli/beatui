import { Ensure, Fragment, OnDispose, Signal, TNode } from '@tempots/dom'
import { ValueController } from './value-controller'

export function EnsureControl<T>(
  controller:
    | ValueController<T | null | undefined>
    | ValueController<T | null>
    | ValueController<T | undefined>,
  then: (controller: ValueController<NonNullable<T>>) => TNode,
  otherwise?: () => TNode
) {
  return Ensure(
    controller.value as Signal<T | null | undefined>,
    () => {
      const transformed = controller.transform(
        v => v!,
        v => v
      )
      return Fragment(
        OnDispose(() => transformed.dispose()),
        then(transformed)
      )
    },
    otherwise
  )
}
