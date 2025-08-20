import { ControlOptions } from './control-options'
import { TNode, Value } from '@tempots/dom'
import { TextArea } from '../input/text-area'
import { Merge } from '@tempots/std'
import { ControlInputWrapper } from './control-input-wrapper'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export type TextAreaControlOptions = Merge<
  ControlOptions<string>,
  {
    rows?: Value<number>
  }
>

export const TextAreaControl = (
  options: TextAreaControlOptions,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: TextArea({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
