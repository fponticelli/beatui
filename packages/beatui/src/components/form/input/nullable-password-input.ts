import { PasswordInput } from './password-input'
import { createNullableStringInput } from './create-nullable-string-input'

/**
 * A nullable variant of {@link PasswordInput} that maps between `string | null` and `string`.
 *
 * Empty strings are converted to `null` on change, and `null` values are displayed
 * as empty strings. Includes a reset button to clear the value back to `null`.
 *
 * @param options - Standard input options for a `string | null` value.
 * @returns A renderable nullable password input component.
 *
 * @example
 * ```ts
 * NullablePasswordInput({
 *   value: prop<string | null>(null),
 *   placeholder: 'Enter password or leave empty...',
 *   onChange: v => console.log('Password:', v != null ? '***' : 'null'),
 * })
 * ```
 */
export const NullablePasswordInput = createNullableStringInput(PasswordInput)
