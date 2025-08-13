import { TNode, Value } from '@tempots/dom'
import { ControlInputWrapper } from './control-input-wrapper'
import { ControlOptions } from './control-options'
import { FileInput, FileInputMode, FileInputOptions } from '../input/file-input'
import { inputOptionsFromController } from '../input/input-options'
import { Merge } from '@tempots/std'

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

const makeOnChangeHandler = (
  controller: ControlOptions<File[]>['controller'],
  onChange?: (files: File[]) => void
) => {
  return (files: File[]) => {
    controller.change(files)
    onChange?.(files)
  }
}

const makeOnBlurHandler = (
  _controller: ControlOptions<File[]>['controller'],
  onBlur?: () => void
) => {
  return () => {
    onBlur?.()
  }
}

export const FileControl = (
  options: FileControlOptions,
  ...children: TNode[]
) => {
  const {
    onChange,
    onBlur,
    accept,
    allowMultiple,
    maxFiles,
    maxFileSize,
    mode,
    ...rest
  } = options

  return ControlInputWrapper(
    {
      ...rest,
      content: FileInput({
        ...rest,
        ...inputOptionsFromController(rest.controller),
        accept,
        allowMultiple,
        maxFiles,
        maxFileSize,
        mode,
        onChange: makeOnChangeHandler(rest.controller, onChange),
        onBlur: makeOnBlurHandler(rest.controller, onBlur),
      } as FileInputOptions),
    },
    ...children
  )
}
