import { Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { FileInputMode, FilesInput } from './files-input'

/**
 * Options for the {@link FileInput} component.
 * Extends standard `InputOptions` for a single file with file-specific settings.
 */
export type FileInputOptions = Merge<
  InputOptions<File | undefined>,
  {
    /** Comma-separated list of accepted MIME types or file extensions (e.g., `'image/*,.pdf'`). */
    accept?: Value<string>
    /** Maximum allowed file size in bytes. Files exceeding this size are rejected. */
    maxFileSize?: Value<number>
    /**
     * Display mode for the file input.
     * @default 'default'
     */
    mode?: Value<FileInputMode>
    /**
     * Whether to show the selected file in a list below the drop zone.
     * @default true
     */
    showFileList?: Value<boolean>
  }
>

/**
 * A single-file input component built on top of {@link FilesInput}.
 *
 * Provides a drag-and-drop zone and click-to-select interface for uploading
 * a single file. Internally delegates to `FilesInput` with `maxFiles: 1`.
 *
 * @param options - Configuration options for the file input.
 * @returns A renderable file input component.
 *
 * @example
 * ```ts
 * FileInput({
 *   value: prop<File | undefined>(undefined),
 *   accept: 'image/*',
 *   maxFileSize: 5 * 1024 * 1024, // 5 MB
 *   onChange: file => console.log('Selected:', file?.name),
 * })
 * ```
 */
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
