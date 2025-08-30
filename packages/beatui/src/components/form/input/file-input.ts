import { Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { FileInputMode, FilesInput } from './files-input'

export type FileInputOptions = Merge<
  InputOptions<File | undefined>,
  {
    accept?: Value<string>
    maxFileSize?: Value<number> // in bytes
    mode?: Value<FileInputMode>
    showFileList?: Value<boolean>
  }
>

export const FileInput = (options: FileInputOptions) => {
  const {
    value: fileValue,
    onInput: fileOnInput,
    onChange: fileOnChange,
    ...rest
  } = options
  return FilesInput({
    ...rest,
    maxFiles: 1,
    value: Value.map(fileValue, v => (v == null ? [] : [v])),
    onChange: files => {
      fileOnChange?.(files[0])
    },
    onInput: files => {
      fileOnInput?.(files[0])
    },
  })
}
