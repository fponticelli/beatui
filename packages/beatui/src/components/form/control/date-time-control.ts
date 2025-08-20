import { TNode } from '@tempots/dom'
import { DateTimeInput } from '../input/date-time-input'
import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export type DateTimeControlOptions = ControlOptions<Date>

export const DateTimeControl = (
  options: DateTimeControlOptions,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: DateTimeInput({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
