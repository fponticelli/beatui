// import { validatePassword, ValidatePasswordId } from '../utils/validation'
import { ControlOptions } from './control-options'
import { PasswordInput } from '../input/password-input'
import { createControl } from './control-factory'
import { TNode } from '@tempots/dom'

const BasePasswordControl = createControl(PasswordInput)

export const PasswordControl = (
  options: ControlOptions<string>,
  ...children: TNode[]
) => {
  return BasePasswordControl(
    {
      label: 'Password',
      ...options,
    },
    ...children
  )
}
