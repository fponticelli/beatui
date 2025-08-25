import { TNode, Value } from '@tempots/dom'
import { ControlOptions } from './control-options'
import { FilesInput } from '../input/files-input'
import { FileInputMode } from '../input/file-input'
import { Merge } from '@tempots/std'
import { ControlInputWrapper } from './control-input-wrapper'
import { inputOptionsFromController } from '../input/input-options'
import { makeOnBlurHandler, makeOnChangeHandler } from './text-control'

export type FilesControlOptions = Merge<
  ControlOptions<File[]>,
  {
    accept?: Value<string>
    maxFiles?: Value<number>
    maxFileSize?: Value<number>
    showFileList?: Value<boolean>
    mode?: Value<FileInputMode>
  }
>

export const FilesControl = (
  options: FilesControlOptions,
  ...children: TNode[]
) => {
  const { onBlur, onChange, ...rest } = options
  return ControlInputWrapper(
    {
      ...rest,
      content: FilesInput({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      }),
    },
    ...children
  )
}
