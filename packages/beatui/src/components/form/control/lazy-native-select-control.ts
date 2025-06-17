import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromController } from '../input/input-options'
import { SelectOption } from '../input/native-select'
import { Signal, TNode, Value } from '@tempots/dom'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'
import { LazyNativeSelect } from '../input/lazy-native-select'

export type LazyNativeSelectControlOptions<T, R> = ControlOptions<T> & {
  request: Signal<R>
  load: (options: {
    request: R
    abortSignal: AbortSignal
  }) => Promise<(SelectOption<T> | { id: T; label: string })[]>
  unselectedLabel?: Value<string>
  equality?: (a: T, b: T) => boolean
}

export const LazyNativeSelectControl = <T, R>(
  options: LazyNativeSelectControlOptions<T, R>,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: LazyNativeSelect({
        ...options,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
