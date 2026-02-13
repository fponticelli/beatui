import { EmailInput } from './email-input'
import { createNullableStringInput } from './create-nullable-string-input'

/**
 * A nullable variant of {@link EmailInput} that maps between `string | null` and `string`.
 *
 * Empty strings are converted to `null` on change, and `null` values are displayed
 * as empty strings. Includes a reset button to clear the value back to `null`.
 *
 * @param options - Standard input options for a `string | null` value.
 * @returns A renderable nullable email input component.
 *
 * @example
 * ```ts
 * NullableEmailInput({
 *   value: prop<string | null>(null),
 *   placeholder: 'Enter email or leave empty...',
 *   onChange: v => console.log('Email:', v), // null or string
 * })
 * ```
 */
export const NullableEmailInput = createNullableStringInput(EmailInput)
