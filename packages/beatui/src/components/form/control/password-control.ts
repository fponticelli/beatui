// import { validatePassword, ValidatePasswordId } from '../utils/validation'
import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromController } from '../input/input-options'
import { PasswordInput } from '../input/password-input'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'
import { TNode } from '@tempots/dom'

export const PasswordControl = (
  options: ControlOptions<string>,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  // options.controller.addValidator(ValidatePasswordId, validatePassword)
  return ControlInputWrapper(
    {
      label: 'Password',
      ...rest,
      content: PasswordInput({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
