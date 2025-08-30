import { Merge, Value } from '@tempots/dom'
import { FileInputMode } from './files-input'
import { FilesInput } from './files-input'
import { decodeBase64 } from '@tempots/std'
import { InputOptions } from './input-options'

export type Base64sInputOptions = Merge<
  InputOptions<string[]>,
  {
    accept?: Value<string>
    maxFiles?: Value<number>
    maxFileSize?: Value<number> // in bytes
    mode?: Value<FileInputMode>
    showFileList?: Value<boolean>
  }
>

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file) // reads file as a data: URL (base64 encoded)
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // strip the "data:*/*;base64," prefix
    }
    reader.onerror = error => reject(error)
  })
}

function filesToBase64s(files: File[]): Promise<string[]> {
  return Promise.all(files.map(fileToBase64))
}

export function Base64sInput(options: Base64sInputOptions) {
  const {
    value: base64Values,
    onChange: base64OnChange,
    onInput: base64OnInput,
    ...rest
  } = options
  const filesMap = new Map<string, string>()
  const value = Value.toSignal(base64Values).map(values => {
    return values.map((value, index) => {
      const name = filesMap.get(value) ?? `file-${index}`
      const bytes = decodeBase64(value ?? '')
      const blob = new Blob([bytes])
      return new File([blob], name)
    })
  })
  const update =
    (fn: ((value: string[]) => void) | undefined) => (files: File[]) => {
      if (base64OnChange != null) {
        filesToBase64s(files).then(vs => {
          for (const [i, v] of vs.entries()) {
            filesMap.set(v, files[i].name)
          }
          fn?.(vs)
        })
      }
    }

  const onChange = update(base64OnChange)
  const onInput = update(base64OnInput)
  return FilesInput({
    ...rest,
    value,
    onChange,
    onInput,
  })
}
