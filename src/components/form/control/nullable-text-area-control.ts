import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { Value } from '@tempots/dom'
import { NullableTextArea } from '../input/nullable-text-area'
import { Merge } from '@tempots/std'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'
import { inputOptionsFromController } from '../input/input-options'

export type NullableTextAreaControlOptions = Merge<
  ControlOptions<string | null>,
  {
    rows?: Value<number>
  }
>

export const NullableTextAreaControl = (
  options: NullableTextAreaControlOptions
) => {
  const { onBlur, onChange, rows, ...rest } = options
  return ControlInputWrapper({
    ...rest,
    content: NullableTextArea({
      ...rest,
      ...inputOptionsFromController(rest.controller),
      rows,
      onChange: makeOnChangeHandler(rest.controller, onChange),
      onBlur: makeOnBlurHandler(rest.controller, onBlur),
    }),
  })
}
