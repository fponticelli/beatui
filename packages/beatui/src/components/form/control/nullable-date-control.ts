import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromController } from '../input/input-options'
import { NullableDateInput } from '../input/nullable-date-input'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export const NullableDateControl = (options: ControlOptions<Date | null>) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper({
    ...rest,
    content: NullableDateInput({
      ...rest,
      ...inputOptionsFromController(rest.controller),
      onChange: makeOnChangeHandler(rest.controller, onChange),
      onBlur: makeOnBlurHandler(rest.controller, onBlur),
    }),
  })
}
