import { ControlOptions } from './control-options'
import { ControlInputWrapper } from './control-input-wrapper'
import { Combobox, ComboboxOption } from '../input/combobox'
import { TNode, Value } from '@tempots/dom'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export type ComboboxControlOptions<T> = ControlOptions<T> & {
  options: Value<ComboboxOption<T>[]>
  unselectedLabel?: Value<string>
  equality?: (a: T, b: T) => boolean
  placeholder?: Value<string>
  searchable?: Value<boolean>
}

export const ComboboxControl = <T>(
  options: ComboboxControlOptions<T>,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: Combobox({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
