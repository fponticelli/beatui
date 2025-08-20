import { TNode } from '@tempots/dom'
import { CheckboxInput } from '../input/checkbox-input'
import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export type CheckboxControlOptions = ControlOptions<boolean>

export const CheckboxControl = (
  options: CheckboxControlOptions,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: CheckboxInput({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
