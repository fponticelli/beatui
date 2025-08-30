import { Merge, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { Base64sInput } from './base64s-input'
import { FileInputMode } from './files-input'

export type Base64InputOptions = Merge<
  InputOptions<string | undefined>,
  {
    accept?: Value<string>
    maxFileSize?: Value<number> // in bytes
    mode?: Value<FileInputMode>
    showFileList?: Value<boolean>
  }
>

export function Base64Input(options: Base64InputOptions) {
  const {
    value: fileValue,
    onInput: fileOnInput,
    onChange: fileOnChange,
    ...rest
  } = options
  return Base64sInput({
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
