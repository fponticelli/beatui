import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromController } from '../input/input-options'
import { TagsInput } from '../input/tags-input'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'
import { TNode } from '@tempots/dom'

export const TagsControl = (
  options: ControlOptions<string[]>,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: TagsInput({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
