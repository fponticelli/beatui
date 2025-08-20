import { TNode } from '@tempots/dom'
import { TagsInput } from '../input/tags-input'
import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export type TagsControlOptions = ControlOptions<string[]>

export const TagsControl = (
  options: TagsControlOptions,
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
