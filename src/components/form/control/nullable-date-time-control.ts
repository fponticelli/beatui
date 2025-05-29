import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromController } from '../input/input-options'
import { NullableDateTimeInput } from '../input/nullable-date-time-input'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export const NullableDateTimeControl = (
  options: ControlOptions<Date | null>
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper({
    ...rest,
    content: NullableDateTimeInput({
      ...rest,
      ...inputOptionsFromController(rest.controller),
      onChange: makeOnChangeHandler(rest.controller, onChange),
      onBlur: makeOnBlurHandler(rest.controller, onBlur),
    }),
  })
}
