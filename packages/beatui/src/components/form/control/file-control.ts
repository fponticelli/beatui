import { Value } from '@tempots/dom'
import { ControlOptions } from './control-options'
import { FileInput, FileInputMode } from '../input/file-input'
import { Merge } from '@tempots/std'
import { createControl } from './control-factory'

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

export const FileControl = createControl(FileInput)
