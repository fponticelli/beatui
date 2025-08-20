import { TNode } from '@tempots/dom'
import { DateInput } from '../input/date-input'
import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export type DateControlOptions = ControlOptions<Date>

export const DateControl = (
  options: DateControlOptions,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: DateInput({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
