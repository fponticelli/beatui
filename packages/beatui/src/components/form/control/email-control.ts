import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { EmailInput } from '../input/email-input'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export const EmailControl = (options: ControlOptions<string>) => {
  const { onChange, onBlur, ...rest } = options
  return ControlInputWrapper({
    label: 'Email',
    ...rest,
    content: EmailInput({
      ...rest,
      ...inputOptionsFromController(rest.controller),
      onChange: makeOnChangeHandler(rest.controller, onChange),
      onBlur: makeOnBlurHandler(rest.controller, onBlur),
    }),
  })
}
