import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromMappedController } from '../input/input-options'
import { NullableDateTimeInput } from '../input/nullable-date-time-input'
import { makeMappedOnChangeHandler, makeOnBlurHandler } from './text-control'

const tzDateToDate = (v: string) => {
  return new Date(v)
}

const dateToTzDate = (v: Date) => {
  const s = v.toISOString()
  return s //.endsWith('Z') ? s.replace('Z', '') : s
}

export const NullableStringDateTimeControl = (
  options: ControlOptions<string | null>
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper({
    ...rest,
    content: NullableDateTimeInput({
      ...rest,
      ...inputOptionsFromMappedController(
        rest.controller,
        (v: string | null) => {
          return v != null && v !== '' ? tzDateToDate(v) : null
        }
      ),
      onChange: makeMappedOnChangeHandler(
        rest.controller,
        v => (v != null ? dateToTzDate(v) : null),
        onChange
      ),
      onBlur: makeOnBlurHandler(rest.controller, onBlur),
    }),
  })
}
