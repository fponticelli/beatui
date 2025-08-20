import { TNode, Value } from '@tempots/dom'
import { ControlOptions } from './control-options'
import { FileInput, FileInputMode } from '../input/file-input'
import { Merge } from '@tempots/std'
import { ControlInputWrapper } from './control-input-wrapper'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export type FileControlOptions = Merge<
  ControlOptions<File[]>,
  {
    accept?: Value<string>
    allowMultiple?: Value<boolean>
    maxFiles?: Value<number>
    maxFileSize?: Value<number>
    showFileList?: Value<boolean>
    mode?: Value<FileInputMode>
  }
>

export const FileControl = (
  options: FileControlOptions,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: FileInput({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
