import { Merge, Value } from '@tempots/dom'
import { FileInputMode } from './files-input'
import { FilesInput } from './files-input'
import { decodeBase64 } from '@tempots/std'
import { InputOptions } from './input-options'

/**
 * Options for the {@link Base64sInput} component.
 * Extends standard `InputOptions` for multiple base64-encoded file strings.
 */
export type Base64sInputOptions = Merge<
  InputOptions<string[]>,
  {
    /** Comma-separated list of accepted MIME types or file extensions. */
    accept?: Value<string>
    /** Maximum number of files that can be selected. */
    maxFiles?: Value<number>
    /** Maximum allowed file size in bytes per file. */
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

/**
 * Converts a `File` object to a base64-encoded string (without the data URL prefix).
 *
 * @param file - The file to convert.
 * @returns A promise that resolves with the base64-encoded string content.
 *
 * @example
 * ```ts
 * const base64 = await fileToBase64(myFile)
 * console.log(base64) // 'iVBORw0KGgoAAAANSUhEUg...'
 * ```
 */
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

function detectMimeType(bytes: Uint8Array): string {
  // PNG: 89 50 4E 47
  if (bytes.length >= 4) {
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    )
      return 'image/png'

    // JPEG: FF D8
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg'

    // GIF: 47 49 46 ('GIF')
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46)
      return 'image/gif'

    // WEBP: 'RIFF'....'WEBP'
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes.length >= 12 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    )
      return 'image/webp'
  }

  // SVG: look for '<svg' in initial chunk decoded as UTF-8
  try {
    const text = new TextDecoder('utf-8').decode(bytes.slice(0, 256))
    if (text.includes('<svg')) return 'image/svg+xml'
  } catch {
    // ignore
  }

  return 'application/octet-stream'
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = decodeBase64(b64 ?? '')
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/**
 * A multi-file input component that produces an array of base64-encoded strings.
 *
 * Wraps {@link FilesInput}, converting selected files to base64 and reconstructing
 * `File` objects from base64 strings for display. Automatically detects MIME types
 * from file magic bytes for proper thumbnail rendering.
 *
 * @param options - Configuration options for the multi-file base64 input.
 * @returns A renderable multi-file base64 input component.
 *
 * @example
 * ```ts
 * Base64sInput({
 *   value: prop<string[]>([]),
 *   accept: 'image/*',
 *   maxFiles: 3,
 *   onChange: base64s => console.log('Files:', base64s.length),
 * })
 * ```
 */
export function Base64sInput(options: Base64sInputOptions) {
  const {
    value: base64Values,
    onChange: base64OnChange,
    onInput: base64OnInput,
    ...rest
  } = options
  const filesMap = new Map<string, { name: string; type: string }>()
  const value = Value.toSignal(base64Values).map(values => {
    return values.map((value, index) => {
      const meta = filesMap.get(value)
      const bytes = base64ToBytes(value ?? '')
      const type = meta?.type || detectMimeType(bytes)
      const name = meta?.name ?? `file-${index}`
      const ab = (bytes.buffer as ArrayBuffer).slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      )
      const blob = new Blob([ab], { type })
      return new File([blob], name, { type })
    })
  })
  const update =
    (fn: ((value: string[]) => void) | undefined) => (files: File[]) => {
      if (fn) {
        filesToBase64s(files).then(vs => {
          for (const [i, v] of vs.entries()) {
            filesMap.set(v, { name: files[i].name, type: files[i].type })
          }
          fn(vs)
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
