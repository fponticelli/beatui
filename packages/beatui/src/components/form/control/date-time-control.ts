import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { DateTimeInput } from '../input/date-time-input'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'
import { TNode } from '@tempots/dom'

export const DateTimeControl = (
  options: ControlOptions<Date>,
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
