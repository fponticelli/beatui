import { ControlOptions } from './control-options'
import { EmailInput } from '../input/email-input'
import { createControl } from './control-factory'
import { TNode } from '@tempots/dom'

const BaseEmailControl = createControl(EmailInput)

export const EmailControl = (
  options: ControlOptions<string>,
  ...children: TNode[]
) => {
  return BaseEmailControl(
    {
      label: 'Email',
      ...options,
    },
    ...children
  )
}
