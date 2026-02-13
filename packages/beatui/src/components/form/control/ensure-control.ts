import { Ensure, Signal, TNode } from '@tempots/dom'
import { Controller } from '../controller/controller'

/**
 * Conditionally renders content only when a controller's value is non-null and non-undefined.
 *
 * Similar to the `Ensure` primitive from `@tempots/dom`, but works with `Controller` instances.
 * When the controller's signal holds a non-nullish value, it creates a transformed controller
 * with `NonNullable<T>` type and passes it to the `then` callback. When the value is null or
 * undefined, it renders the optional `otherwise` fallback.
 *
 * @typeParam T - The non-nullable base type of the controller's value
 *
 * @param controller - A controller whose value may be `null`, `undefined`, or `T`
 * @param then - Callback invoked with a `Controller<NonNullable<T>>` when the value is present
 * @param otherwise - Optional callback invoked when the value is null or undefined
 *
 * @returns A renderable TNode that conditionally renders based on the controller's value
 *
 * @example
 * ```typescript
 * import { EnsureControl } from '@tempots/beatui'
 *
 * // Only render the text input when the controller value is non-null
 * EnsureControl(
 *   nullableStringController,
 *   (ctrl) => TextInput({ value: ctrl.signal, onChange: ctrl.change }),
 *   () => html.p('No value set')
 * )
 * ```
 */
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
