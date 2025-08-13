import {
  Value,
  html,
  attr,
  prop,
  Signal,
  on,
  ForEach,
  NotEmpty,
  When,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'
import { UnstyledDropZone } from '../../data/unstyled-drop-zone'
import { Icon } from '../../data/icon'
import { Merge } from '@tempots/std'
import { formatFileSize } from '../../../utils'

export type FileInputOptions = Merge<
  InputOptions<File[]>,
  {
    accept?: Value<string>
    allowMultiple?: Value<boolean>
    maxFiles?: Value<number>
    minFiles?: Value<number> // in bytes
    minFileSize?: Value<number> // in bytes
    maxFileSize?: Value<number> // in bytes
    maxTotalFileSize?: Value<number> // in bytes
  }
>

function getFileIcon(file: File): string {
  const type = file.type.toLowerCase()
  if (type.startsWith('image/')) return 'mdi:file-image'
  if (type.startsWith('video/')) return 'mdi:file-video'
  if (type.startsWith('audio/')) return 'mdi:file-music'
  if (type.includes('pdf')) return 'mdi:file-pdf-box'
  if (type.includes('word') || type.includes('document')) return 'mdi:file-word'
  if (type.includes('excel') || type.includes('spreadsheet'))
    return 'mdi:file-excel'
  if (type.includes('powerpoint') || type.includes('presentation'))
    return 'mdi:file-powerpoint'
  if (type.includes('zip') || type.includes('archive'))
    return 'mdi:file-archive'
  if (type.includes('text')) return 'mdi:file-document'
  return 'mdi:file'
}

export const FileInput = (options: FileInputOptions) => {
  const {
    value = prop([]),
    accept = '*/*',
    allowMultiple = true,
    maxFiles,
    maxFileSize,
    onChange,
    onBlur: _onBlur,
    disabled,
    hasError,
    minFiles: _minFiles,
    minFileSize: _minFileSize,
    maxTotalFileSize: _maxTotalFileSize,
    ...rest
  } = options

  const files = value as Signal<File[]>

  const handleFilesChange = (newFiles: File[]) => {
    let filteredFiles = newFiles

    // Apply max files limit
    if (maxFiles) {
      const limit = Value.get(maxFiles)
      filteredFiles = filteredFiles.slice(0, limit)
    }

    // Apply file size limit
    if (maxFileSize) {
      const sizeLimit = Value.get(maxFileSize)
      filteredFiles = filteredFiles.filter(file => file.size <= sizeLimit)
    }

    // Update value
    if (!Value.get(allowMultiple) && filteredFiles.length > 0) {
      filteredFiles = [filteredFiles[0]]
    }

    onChange?.(filteredFiles)
  }

  const removeFile = (index: number) => {
    const currentFiles = files.value
    const newFiles = currentFiles.filter((_, i) => i !== index)
    onChange?.(newFiles)
  }

  const clearAllFiles = () => {
    onChange?.([])
  }

  const dropZoneContent = ({
    files: _currentFiles,
    clear: _clear,
    change: _change,
  }: {
    files: Signal<File[]>
    clear: () => void
    change: (files: File[]) => void
  }) => {
    return html.div(
      attr.class('bc-file-input__drop-zone'),
      html.div(
        attr.class(
          'bc-file-input__drop-zone-content bc-file-input__drop-zone-content--empty'
        ),
        Icon({ icon: 'mdi:cloud-upload-outline', size: 'xl' }),
        html.div(
          attr.class('bc-file-input__drop-zone-text'),
          'Drag and drop files here, or click to select'
        )
      )
    )
  }

  return InputContainer({
    baseContainer: true,
    disabled,
    hasError,
    ...rest,
    input: html.div(
      attr.class('bc-file-input'),
      UnstyledDropZone({
        value: files,
        accept,
        allowMultiple,
        enableClick: true,
        disabled,
        onChange: handleFilesChange,
        content: dropZoneContent,
      }),
      NotEmpty(files, () =>
        html.div(
          attr.class('bc-file-input__file-list'),
          ForEach(files, (file, position) => {
            const index = position.index
            return html.div(
              attr.class('bc-file-input__file-item'),
              html.div(
                attr.class('bc-file-input__file-icon'),
                Icon({ icon: file.map(getFileIcon), size: 'md' })
              ),
              html.div(
                attr.class('bc-file-input__file-info'),
                html.div(attr.class('bc-file-input__file-name'), file.$.name),
                html.div(
                  attr.class('bc-file-input__file-meta'),
                  file.$.size.map(v => formatFileSize(v)),
                  ' • ',
                  file.$.type.map(type => type || 'Unknown type')
                )
              ),
              html.button(
                attr.type('button'),
                attr.class('bc-file-input__remove-button'),
                attr.title('Remove file'),
                attr.disabled(disabled),
                Icon({ icon: 'mdi:close', size: 'sm' }),
                on.click((e: Event) => {
                  e.preventDefault()
                  e.stopPropagation()
                  removeFile(index)
                })
              )
            )
          }),
          When(
            files.map(({ length }) => length > 1),
            () =>
              html.button(
                attr.type('button'),
                attr.class('bc-file-input__clear-all-button'),
                attr.disabled(disabled),
                'Clear all files',
                on.click((e: Event) => {
                  e.preventDefault()
                  e.stopPropagation()
                  clearAllFiles()
                })
              )
          )
        )
      )
    ),
  })
}
