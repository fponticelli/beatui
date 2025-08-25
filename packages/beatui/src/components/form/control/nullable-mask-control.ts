import { TNode } from '@tempots/dom'
import {
  NullableMaskInput,
  NullableMaskInputOptions,
} from '../input/nullable-mask-input'
import { ControlInputWrapper } from './control-input-wrapper'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'
import { Controller } from '../controller'

export const NullableMaskControl = (
  options: NullableMaskInputOptions & {
    controller: Controller<string | null>
  },
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: NullableMaskInput({
        ...rest,
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
