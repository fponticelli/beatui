import { TNode, Value } from '@tempots/dom'
import { ControlOptions } from './control-options'
import { FileInputMode } from '../input/file-input'
import { Merge } from '@tempots/std'
import { ControlInputWrapper } from './control-input-wrapper'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'
import { Base64sInput } from '../input/base64s-input'

export type Base64Options = Merge<
  ControlOptions<string[]>,
  {
    accept?: Value<string>
    maxFiles?: Value<number>
    maxFileSize?: Value<number>
    showFileList?: Value<boolean>
    mode?: Value<FileInputMode>
  }
>

export const Base64sControl = (
  options: Base64Options,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: Base64sInput({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
