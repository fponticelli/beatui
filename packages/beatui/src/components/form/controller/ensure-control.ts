import { Ensure, Fragment, OnDispose, Signal, TNode } from '@tempots/dom'
import { Controller } from './value-controller'

export function EnsureControl<T>(
  controller:
    | Controller<T | null | undefined>
    | Controller<T | null>
    | Controller<T | undefined>,
  then: (controller: Controller<NonNullable<T>>) => TNode,
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
