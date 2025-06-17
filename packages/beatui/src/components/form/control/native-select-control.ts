import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromController } from '../input/input-options'
import { NativeSelect, SelectOption } from '../input/native-select'
import { TNode, Value } from '@tempots/dom'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'
// import { Validation } from '@tempots/std'

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
  // rest.controller.addValidator(Symbol('AnyOf'), value => {
  //   if (value === null || value === undefined) {
  //     return Validation.invalid(ValidationError.message('No value selected'))
  //   }
  //   const contains = SelectOption.contains(
  //     Value.get(options.options),
  //     value,
  //     options.equality
  //   )
  //   if (contains) {
  //     return Validation.valid
  //   }
  //   return Validation.invalid(
  //     ValidationError.message(`Value is not one of the options`)
  //   )
  // })
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
