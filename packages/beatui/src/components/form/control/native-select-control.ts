import { ControlOptions } from './control-options'
import { ControlInputWrapper } from './control-input-wrapper'
import { NativeSelect, SelectOption } from '../input/native-select'
import { TNode, Value } from '@tempots/dom'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export type NativeSelectControlOptions<T> = ControlOptions<T> & {
  options: Value<SelectOption<T>[]>
  unselectedLabel?: Value<string>
  equality?: (a: T, b: T) => boolean
}

export const NativeSelectControl = <T>(
  options: NativeSelectControlOptions<T>,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: NativeSelect({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
