import { Ensure, Fragment, OnDispose, Signal, TNode } from '@tempots/dom'
import { Controller } from '../controller/controller'

export function EnsureControl<T>(
  controller:
    | Controller<T | null | undefined>
    | Controller<T | null>
    | Controller<T | undefined>,
  then: (controller: Controller<NonNullable<T>>) => TNode,
  otherwise?: () => TNode
) {
  return Ensure(
    controller.signal as Signal<T | null | undefined>,
    () => {
      const transformed = controller.transform(
        v => v!,
        v => v
      )
      return then(transformed)
    },
    otherwise
  )
}
