import { UrlInput } from './url-input'
import { createNullableStringInput } from './create-nullable-string-input'

/**
 * A nullable variant of {@link UrlInput} that maps between `string | null` and `string`.
 *
 * Empty strings are converted to `null` on change, and `null` values are displayed
 * as empty strings. Includes a reset button to clear the value back to `null`.
 *
 * @param options - Standard input options for a `string | null` value.
 * @returns A renderable nullable URL input component.
 *
 * @example
 * ```ts
 * NullableUrlInput({
 *   value: prop<string | null>(null),
 *   placeholder: 'Enter URL or leave empty...',
 *   onChange: v => console.log('URL:', v), // null or string
 * })
 * ```
 */
export const NullableUrlInput = createNullableStringInput(UrlInput)
