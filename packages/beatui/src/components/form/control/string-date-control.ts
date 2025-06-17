import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { DateInput } from '../input/date-input'
import { inputOptionsFromMappedController } from '../input/input-options'
import { makeMappedOnChangeHandler, makeOnBlurHandler } from './text-control'
import { TNode } from '@tempots/dom'

export const StringDateControl = (
  options: ControlOptions<string>,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: DateInput({
        ...rest,
        ...inputOptionsFromMappedController(
          rest.controller,
          (v: string) => new Date(v)
        ),
        onChange: makeMappedOnChangeHandler(
          rest.controller,
          v => v.toISOString(),
          onChange
        ),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
