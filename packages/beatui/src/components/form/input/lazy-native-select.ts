import { html, Signal, Use, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { NativeSelect } from './native-select'
import { Query } from '@tempots/ui'
import { BeatUII18n } from '../../../beatui-i18n'
import { Icon } from '../../data'
import { Option, SelectOption } from './option'

/**
 * Options for the {@link LazyNativeSelect} component.
 * Extends standard `InputOptions` with async option loading.
 *
 * @typeParam T - The type of option values.
 * @typeParam R - The type of the request signal that triggers loading.
 */
export type LazyNativeSelectOptions<T, R> = InputOptions<T> & {
  /** A reactive signal whose changes trigger option reloading. */
  request: Signal<R>
  /**
   * Async function that loads options. Receives the current request value
   * and an abort signal for cancellation. Can return either `SelectOption<T>`
   * objects or simplified `{ id, label }` objects.
   */
  load: (options: {
    request: R
    abortSignal: AbortSignal
  }) => Promise<(SelectOption<T> | { id: T; label: string })[]>
  /** Label for the initial unselected/placeholder option. */
  unselectedLabel?: Value<string>
  /**
   * Custom equality function for comparing option values.
   * @default (a, b) => a === b
   */
  equality?: (a: T, b: T) => boolean
}

/**
 * A native select input that loads its options asynchronously.
 *
 * Shows a loading spinner while options are being fetched, then renders a
 * standard {@link NativeSelect} once loaded. Options are reloaded whenever
 * the `request` signal changes.
 *
 * @typeParam T - The type of option values.
 * @typeParam R - The type of the request signal that triggers loading.
 * @param options - Configuration options for the lazy native select.
 * @returns A renderable lazy native select component.
 *
 * @example
 * ```ts
 * LazyNativeSelect({
 *   value: prop<string>(''),
 *   request: prop({ search: '' }),
 *   load: async ({ request, abortSignal }) => {
 *     const response = await fetch(`/api/options?q=${request.search}`, { signal: abortSignal })
 *     return response.json()
 *   },
 *   onChange: value => console.log('Selected:', value),
 * })
 * ```
 */
export const LazyNativeSelect = <T, R>(
  options: LazyNativeSelectOptions<T, R>
) => {
  return Query({
    request: options.request,
    load: options.load,
    convertError: String,
    success: ({ value: list }) => {
      const selectOptions = list.map(ls =>
        ls.map(item => {
          if (typeof item === 'object' && 'id' in item && 'label' in item) {
            return Option.value(item.id, item.label)
          }
          return item as SelectOption<T>
        })
      )
      return NativeSelect<T>({
        ...options,
        options: selectOptions,
        unselectedLabel: options.unselectedLabel,
        equality: options.equality,
      })
    },
    pending: () =>
      Use(BeatUII18n, t =>
        html.span(
          Icon({
            icon: 'line-md:loading-twotone-loop',
            title: t.$.loadingShort as Signal<string | undefined>,
          })
        )
      ),
  })
}
