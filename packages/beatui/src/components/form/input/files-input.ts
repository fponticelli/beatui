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
  bind,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'
import { UnstyledDropZone } from '../../data/unstyled-drop-zone'
import { Icon } from '../../data/icon'
import { Merge } from '@tempots/std'
import { formatFileSize } from '../../../utils'
import { BeatUII18n } from '../../../beatui-i18n'
import { CloseButton } from '../../button'

/**
 * Display mode for file input components.
 * - `'default'` - Full drop zone with file list below.
 * - `'input'` - Inline input-style with compact file chips.
 * - `'compact'` - Compact drop zone with inline file previews.
 */
export type FileInputMode = 'default' | 'input' | 'compact'

/**
 * Options for the {@link FilesInput} component.
 * Extends standard `InputOptions` for a `File[]` value with file-specific settings.
 */
export type FilesInputOptions = Merge<
  InputOptions<File[]>,
  {
    /** Comma-separated list of accepted MIME types or file extensions (e.g., `'image/*,.pdf'`). */
    accept?: Value<string>
    /** Maximum number of files that can be selected. */
    maxFiles?: Value<number>
    /** Maximum allowed file size in bytes. Files exceeding this size are filtered out. */
    maxFileSize?: Value<number>
    /**
     * Display mode for the file input.
     * @default 'default'
     */
    mode?: Value<FileInputMode>
    /**
     * Whether to show the selected files in a list below the drop zone.
     * @default true
     */
    showFileList?: Value<boolean>
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

function createFilePreview(file: Signal<File>) {
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
        OnDispose(() => {
          if (thumbnailUrl.value) {
            URL.revokeObjectURL(thumbnailUrl.value)
          }
        }),
        attr.class('bc-file-input__thumbnail-container'),
        html.img(
          attr.src(thumbnailUrl),
          attr.alt(file.map(f => f.name)),
          attr.class('bc-file-input__thumbnail')
        )
      )
    },
    () => Icon({ icon: file.map(getFileIcon) })
  )
}

/**
 * A multi-file input component with drag-and-drop support.
 *
 * Supports multiple display modes (`default`, `input`, `compact`), file type
 * filtering, file size limits, thumbnail previews for images, and per-file
 * removal. Integrates with the i18n system for localized messages.
 *
 * @param options - Configuration options for the multi-file input.
 * @param children - Additional child nodes to render inside the container.
 * @returns A renderable file input component.
 *
 * @example
 * ```ts
 * FilesInput({
 *   value: prop<File[]>([]),
 *   accept: 'image/*,.pdf',
 *   maxFiles: 5,
 *   maxFileSize: 10 * 1024 * 1024, // 10 MB
 *   mode: 'default',
 *   onChange: files => console.log('Files:', files.length),
 * })
 * ```
 */
export const FilesInput = (
  options: FilesInputOptions,
  ...children: TNode[]
) => {
  const {
    value = prop([]),
    accept = '*/*',
    maxFiles,
    maxFileSize,
    onChange,
    onBlur: _onBlur,
    disabled,
    hasError,
    mode = 'default',
    showFileList = true,
    ...rest
  } = options

  const files = value as Signal<File[]>
  const isInputMode = Value.map(mode, m => m === 'input')
  const isCompactMode = Value.map(mode, m => m === 'compact')

  const handleFilesChange = (newFiles: File[]) => {
    let filteredFiles = newFiles

    // Apply max files limit
    if (maxFiles != null) {
      const limit = Value.get(maxFiles)
      filteredFiles = filteredFiles.slice(0, limit)
    }

    // Apply file size limit
    if (maxFileSize) {
      const sizeLimit = Value.get(maxFileSize)
      filteredFiles = filteredFiles.filter(file => file.size <= sizeLimit)
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
            bind(t.$.filesInputInstructions)(
              maxFiles as Signal<number | undefined>,
              maxFileSize as Signal<number | undefined>,
              t.$.fileSizeUnits.value
            )
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
        attr.class('bc-file-input__compact-drop-zone'),
        When(
          files.map(f => f.length > 0),
          () =>
            html.div(
              attr.class('bc-file-input__compact-file-list'),
              ForEach(files, (file, position) => {
                const index = position.index
                return html.div(
                  attr.class('bc-file-input__compact-file-item'),
                  html.div(
                    attr.class('bc-file-input__compact-file-icon'),
                    createFilePreview(file)
                  ),
                  html.div(
                    attr.class('bc-file-input__compact-file-info'),
                    html.div(
                      attr.class('bc-file-input__compact-file-name'),
                      attr.title(file.$.name),
                      file.$.name
                    ),
                    html.div(
                      attr.class('bc-file-input__compact-file-meta'),
                      computedOf(
                        file.$.size,
                        t.$.fileSizeUnits
                      )((size, units) => formatFileSize(size, { units })),
                      ' • ',
                      computedOf(
                        file.$.type,
                        t.$.unknownType
                      )((type, unknownType) => type || unknownType)
                    )
                  ),
                  CloseButton(
                    {
                      size: 'sm',
                      label: t.$.removeFile,
                      disabled,
                      onClick: () => removeFile(index),
                    },
                    attr.class('bc-file-input__compact-remove-button')
                  )
                )
              })
            ),
          () =>
            html.div(
              attr.class('bc-file-input__compact-placeholder'),
              Icon({ icon: 'mdi:cloud-upload-outline', size: 'lg' }),
              html.div(
                attr.class('bc-file-input__compact-placeholder-text'),
                bind(t.$.filesInputInstructions)(
                  maxFiles as Signal<number | undefined>,
                  maxFileSize as Signal<number | undefined>,
                  t.$.fileSizeUnits.value
                )
              )
            )
        )
      )
    )
  }

  const inputDropZoneContent = ({
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
                  createFilePreview(file),
                  html.span(
                    attr.class('bc-file-input__compact-value-item-name'),
                    file.$.name
                  )
                )
              )
            ),
          () =>
            html.span(
              attr.class('bc-file-input__compact-placeholder'),
              Icon({ icon: 'mdi:cloud-upload-outline', size: 'md' }),
              ' ',
              bind(t.$.filesInputInstructions)(
                maxFiles as Signal<number | undefined>,
                maxFileSize as Signal<number | undefined>,
                t.$.fileSizeUnits.value
              )
            )
        )
      )
    )
  }

  return Use(BeatUII18n, t =>
    InputContainer(
      {
        baseContainer: Value.map(isInputMode, c => !c),
        disabled,
        hasError,
        after: When(isInputMode, () =>
          When(
            files.map(({ length }) => length > 0),
            () =>
              CloseButton(
                {
                  size: 'sm',
                  label: t.$.clearAllFiles,
                  disabled,
                  onClick: clearAllFiles,
                },
                attr.class('bc-file-input__compact-clear')
              )
          )
        ),
        ...rest,
        input: When(
          isInputMode,
          () =>
            html.div(
              attr.class('bc-file-input bc-file-input--input'),
              UnstyledDropZone({
                value: files,
                accept,
                enableClick: true,
                allowMultiple: Value.map(maxFiles ?? Infinity, m => m > 1),
                disabled,
                onChange: handleFilesChange,
                content: inputDropZoneContent,
              })
            ),
          () =>
            When(
              isCompactMode,
              () =>
                html.div(
                  attr.class('bc-file-input bc-file-input--compact'),
                  UnstyledDropZone({
                    value: files,
                    accept,
                    enableClick: true,
                    allowMultiple: Value.map(maxFiles ?? Infinity, m => m > 1),
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
                    enableClick: true,
                    allowMultiple: Value.map(maxFiles ?? Infinity, m => m > 1),
                    disabled,
                    onChange: handleFilesChange,
                    content: dropZoneContent,
                  }),
                  When(showFileList, () =>
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
                                    t.$.fileSizeUnits
                                  )((size, units) =>
                                    formatFileSize(size, { units })
                                  ),
                                  ' • ',
                                  computedOf(
                                    file.$.type,
                                    t.$.unknownType
                                  )((type, unknownType) => type || unknownType)
                                )
                              ),
                              CloseButton(
                                {
                                  size: 'sm',
                                  label: t.$.removeFile,
                                  disabled,
                                  onClick: () => removeFile(index),
                                },
                                attr.class('bc-file-input__remove-button')
                              )
                            )
                          })
                        ),
                        When(
                          files.map(({ length }) => length > 1),
                          () =>
                            html.div(
                              attr.class(
                                'bc-file-input__clear-all-button-container'
                              ),
                              html.button(
                                attr.type('button'),
                                attr.class('bc-file-input__clear-all-button'),
                                attr.disabled(disabled),
                                t.$.clearAllFiles,
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
                )
            )
        ),
      },
      ...children
    )
  )
}
