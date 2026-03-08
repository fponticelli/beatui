import { UuidInput } from './uuid-input'
import { createNullableStringInput } from './create-nullable-string-input'

/**
 * A nullable variant of {@link UuidInput} that maps between `string | null` and `string`.
 *
 * Empty strings are converted to `null` on change, and `null` values are displayed
 * as empty strings. Includes a reset button to clear the value back to `null`.
 * Retains the 8-4-4-4-12 hex digit mask from `UuidInput`.
 *
 * @param options - Standard input options for a `string | null` value.
 * @returns A renderable nullable UUID input component.
 *
 * @example
 * ```ts
 * NullableUuidInput({
 *   value: prop<string | null>(null),
 *   onChange: v => console.log('UUID:', v), // null or string
 * })
 * ```
 */
export const NullableUuidInput = createNullableStringInput(UuidInput)
