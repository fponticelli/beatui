import { html, Signal, Use, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { NativeSelect } from './native-select'
import { Resource } from '@tempots/ui'
import { BeatUII18n } from '@/beatui-i18n'
import { Icon } from '@/components/data'
import { Option, SelectOption } from './option'

export type LazyNativeSelectOptions<T, R> = InputOptions<T> & {
  request: Signal<R>
  load: (options: {
    request: R
    abortSignal: AbortSignal
  }) => Promise<(SelectOption<T> | { id: T; label: string })[]>
  unselectedLabel?: Value<string>
  equality?: (a: T, b: T) => boolean
}

export const LazyNativeSelect = <T, R>(
  options: LazyNativeSelectOptions<T, R>
) => {
  return Resource({
    request: options.request,
    load: options.load,
    mapError: String,
  })({
    success: list => {
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
    loading: () =>
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
