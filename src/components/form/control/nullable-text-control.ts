import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromController } from '../input/input-options'
import { NullableTextInput } from '../input/nullable-text-input'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export const NullableTextControl = (options: ControlOptions<string | null>) => {
  const { onBlur, onChange, ...rest } = options

  return ControlInputWrapper({
    ...rest,
    content: NullableTextInput({
      ...rest,
      ...inputOptionsFromController(rest.controller),
      onChange: makeOnChangeHandler(rest.controller, onChange),
      onBlur: makeOnBlurHandler(rest.controller, onBlur),
    }),
  })
}
