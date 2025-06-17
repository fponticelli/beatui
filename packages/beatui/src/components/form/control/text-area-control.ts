import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { TNode, Value } from '@tempots/dom'
import { TextArea } from '../input/text-area'
import { Merge } from '@tempots/std'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'
import { inputOptionsFromController } from '../input/input-options'

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
  const { onBlur, onChange, rows, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: TextArea({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        rows,
        value: rest.controller.value,
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
