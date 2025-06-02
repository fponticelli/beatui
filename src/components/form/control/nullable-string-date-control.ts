import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromMappedController } from '../input/input-options'
import { NullableDateInput } from '../input/nullable-date-input'
import { makeMappedOnChangeHandler, makeOnBlurHandler } from './text-control'

export const NullableStringDateControl = (
  options: ControlOptions<string | null>
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper({
    ...rest,
    content: NullableDateInput({
      ...rest,
      ...inputOptionsFromMappedController(
        rest.controller,
        (v: string | null) => (v != null && v !== '' ? new Date(v) : null)
      ),
      onChange: makeMappedOnChangeHandler(
        rest.controller,
        v => (v != null ? v.toISOString().split('T')[0]! : null),
        onChange
      ),
      onBlur: makeOnBlurHandler(rest.controller, onBlur),
    }),
  })
}
