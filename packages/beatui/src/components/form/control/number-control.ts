import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromController } from '../input/input-options'
import { Merge } from '@tempots/std'
import { Value } from '@tempots/dom'
import { NumberInput } from '../input/number-input'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export type NumberControlOptions = Merge<
  ControlOptions<number>,
  {
    step?: Value<number>
    min?: Value<number>
    max?: Value<number>
  }
>

export const NumberControl = (options: NumberControlOptions) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper({
    ...rest,
    content: NumberInput({
      ...rest,
      ...inputOptionsFromController(rest.controller),
      onChange: makeOnChangeHandler(rest.controller, onChange),
      onBlur: makeOnBlurHandler(rest.controller, onBlur),
    }),
  })
}
