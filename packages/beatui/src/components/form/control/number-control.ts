import { ControlOptions } from './control-options'
import { Merge } from '@tempots/std'
import { Value, TNode } from '@tempots/dom'
import { NumberInput, NumberInputOptions } from '../input/number-input'
import { ControlInputWrapper } from './control-input-wrapper'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export type NumberControlOptions = Merge<
  ControlOptions<number>,
  {
    step?: Value<number>
    min?: Value<number>
    max?: Value<number>
  }
>

export const NumberControl = (
  options: NumberControlOptions,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options

  return ControlInputWrapper(
    {
      ...rest,
      content: NumberInput({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      } as NumberInputOptions),
    },
    ...children
  )
}
