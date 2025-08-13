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
  OnDispose,
  TNode,
  Fragment,
  Use,
  computedOf,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'
import { UnstyledDropZone } from '../../data/unstyled-drop-zone'
import { Icon } from '../../data/icon'
import { Merge } from '@tempots/std'
import { formatFileSize } from '../../../utils'
import { BeatUII18n } from '@/beatui-i18n'

export type FileInputMode = 'default' | 'compact'

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
    mode?: Value<FileInputMode>
  }
>

function canRenderThumbnail(file: File): boolean {
  const type = file.type.toLowerCase()
  return (
    type.startsWith('image/') &&
    (type.includes('jpeg') ||
      type.includes('jpg') ||
      type.includes('png') ||
      type.includes('gif') ||
      type.includes('webp') ||
      type.includes('svg'))
  )
}

function getFileIcon(file: File): string {
  const type = file.type.toLowerCase()
  if (type.startsWith('image/')) return 'vscode-icons:file-type-image'
  if (type.startsWith('video/')) return 'vscode-icons:file-type-video'
  if (type.startsWith('audio/')) return 'vscode-icons:file-type-audio'
  if (type.includes('pdf')) return 'vscode-icons:file-type-pdf2'
  if (type.includes('word') || type.includes('document'))
    return 'vscode-icons:file-type-word'
  if (type.includes('excel') || type.includes('spreadsheet'))
    return 'vscode-icons:file-type-excel'
  if (type.includes('powerpoint') || type.includes('presentation'))
    return 'vscode-icons:file-type-powerpoint'
  if (type.includes('zip') || type.includes('archive'))
    return 'vscode-icons:file-type-zip'
  if (type.includes('text')) return 'vscode-icons:file-type-text'
  if (type.includes('json')) return 'vscode-icons:file-type-json-official'
  if (type.includes('csv')) return 'vscode-icons:file-type-csv'
  if (type.includes('xml')) return 'vscode-icons:file-type-xml'
  if (type.includes('yaml')) return 'vscode-icons:file-type-yaml-official'
  return 'vscode-icons:file-type-binary'
}

function createFilePreview(file: Signal<File>): TNode {
  return When(
    file.map(canRenderThumbnail),
    () => {
      const thumbnailUrl = prop<string | null>(null)

      // Create object URL for the file
      file.on(f => {
        if (thumbnailUrl.value) {
          URL.revokeObjectURL(thumbnailUrl.value)
        }
        const url = URL.createObjectURL(f)
        thumbnailUrl.value = url
      })

      return html.div(
        attr.class('bc-file-input__thumbnail-container'),
        html.img(
          attr.src(thumbnailUrl),
          attr.alt(file.map(f => f.name)),
          attr.class('bc-file-input__thumbnail'),
          OnDispose(() => {
            if (thumbnailUrl.value) {
              URL.revokeObjectURL(thumbnailUrl.value)
            }
          })
        )
      )
    },
    () => Icon({ icon: file.map(getFileIcon), size: 'xl' })
  )
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
    mode = 'default',
    ...rest
  } = options

  const files = value as Signal<File[]>
  const isCompact = Value.map(mode, m => m === 'compact')

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
    return Use(BeatUII18n, t =>
      html.div(
        attr.class('bc-file-input__drop-zone'),
        html.div(
          attr.class(
            'bc-file-input__drop-zone-content bc-file-input__drop-zone-content--empty'
          ),
          Icon({ icon: 'mdi:cloud-upload-outline', size: 'xl' }),
          html.div(
            attr.class('bc-file-input__drop-zone-text'),
            t.fileInputInstructions()
          )
        )
      )
    )
  }

  const compactDropZoneContent = ({
    files,
  }: {
    files: Signal<File[]>
    clear: () => void
    change: (files: File[]) => void
  }) => {
    return Use(BeatUII18n, t =>
      html.div(
        attr.class('bc-file-input__compact-input'),
        When(
          files.map(f => f.length > 0),
          () =>
            html.span(
              attr.class('bc-file-input__compact-value'),
              ForEach(files, file =>
                html.span(
                  attr.class('bc-file-input__compact-value-item'),
                  file.$.name
                )
              )
            ),
          () =>
            html.span(
              attr.class('bc-file-input__compact-placeholder'),
              t.fileInputInstructions()
            )
        )
      )
    )
  }

  return Use(BeatUII18n, t =>
    InputContainer({
      baseContainer: Value.map(isCompact, c => !c),
      disabled,
      hasError,
      after: When(isCompact, () =>
        When(
          files.map(({ length }) => length > 0),
          () =>
            html.button(
              attr.type('button'),
              attr.class('bc-file-input__compact-clear'),
              attr.title(t.clearAllFiles()),
              attr.disabled(disabled),
              Icon({ icon: 'mdi:close', size: 'sm' }),
              on.click((e: Event) => {
                e.preventDefault()
                e.stopPropagation()
                clearAllFiles()
              })
            )
        )
      ),
      ...rest,
      input: When(
        isCompact,
        () =>
          html.div(
            attr.class('bc-file-input bc-file-input--compact'),
            UnstyledDropZone({
              value: files,
              accept,
              allowMultiple,
              enableClick: true,
              disabled,
              onChange: handleFilesChange,
              content: compactDropZoneContent,
            })
          ),
        () =>
          html.div(
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
              Fragment(
                html.div(
                  attr.class('bc-file-input__file-list'),
                  ForEach(files, (file, position) => {
                    const index = position.index
                    return html.div(
                      attr.class('bc-file-input__file-item'),
                      html.div(
                        attr.class('bc-file-input__file-icon'),
                        createFilePreview(file)
                      ),
                      html.div(
                        attr.class('bc-file-input__file-info'),
                        html.div(
                          attr.class('bc-file-input__file-name'),
                          attr.title(file.$.name),
                          file.$.name
                        ),
                        html.div(
                          attr.class('bc-file-input__file-meta'),
                          computedOf(
                            file.$.size,
                            t.fileSizeUnits()
                          )((size, units) => formatFileSize(size, { units })),
                          ' • ',
                          computedOf(
                            file.$.type,
                            t.unknownType()
                          )((type, unknownType) => type || unknownType)
                        )
                      ),
                      html.button(
                        attr.type('button'),
                        attr.class('bc-file-input__remove-button'),
                        attr.title(t.removeFile()),
                        attr.disabled(disabled),
                        Icon({ icon: 'mdi:close', size: 'sm' }),
                        on.click((e: Event) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeFile(index)
                        })
                      )
                    )
                  })
                ),
                When(
                  files.map(({ length }) => length > 1),
                  () =>
                    html.div(
                      attr.class('bc-file-input__clear-all-button-container'),
                      html.button(
                        attr.type('button'),
                        attr.class('bc-file-input__clear-all-button'),
                        attr.disabled(disabled),
                        t.clearAllFiles(),
                        on.click((e: Event) => {
                          e.preventDefault()
                          e.stopPropagation()
                          clearAllFiles()
                        })
                      )
                    )
                )
              )
            )
          )
      ),
    })
  )
}
