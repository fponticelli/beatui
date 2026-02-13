import { Merge, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { Base64sInput } from './base64s-input'
import { FileInputMode } from './files-input'

/**
 * Options for the {@link Base64Input} component.
 * Extends standard `InputOptions` for a single base64-encoded file string.
 */
export type Base64InputOptions = Merge<
  InputOptions<string | undefined>,
  {
    /** Comma-separated list of accepted MIME types or file extensions. */
    accept?: Value<string>
    /** Maximum allowed file size in bytes. */
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
 * A single-file input component that produces a base64-encoded string value.
 *
 * Wraps {@link Base64sInput} with `maxFiles: 1`, providing a file upload interface
 * that converts the selected file to a base64 string. Useful for embedding small
 * files (images, documents) directly as base64 data.
 *
 * @param options - Configuration options for the base64 file input.
 * @returns A renderable base64 file input component.
 *
 * @example
 * ```ts
 * Base64Input({
 *   value: prop<string | undefined>(undefined),
 *   accept: 'image/png,image/jpeg',
 *   maxFileSize: 2 * 1024 * 1024, // 2 MB
 *   onChange: base64 => console.log('Base64 length:', base64?.length),
 * })
 * ```
 */
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
