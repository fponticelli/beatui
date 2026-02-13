import { TextInput } from './text-input'
import {
  createNullableStringInput,
  emptyToNull,
  nullToEmpty,
} from './create-nullable-string-input'

// Re-export utility functions for backward compatibility
export { emptyToNull, nullToEmpty }

/**
 * A nullable variant of {@link TextInput} that maps between `string | null` and `string`.
 *
 * Empty strings are converted to `null` on change, and `null` values are displayed
 * as empty strings. Includes a reset button to clear the value back to `null`.
 *
 * @param options - Standard input options for a `string | null` value.
 * @returns A renderable nullable text input component.
 *
 * @example
 * ```ts
 * NullableTextInput({
 *   value: prop<string | null>(null),
 *   placeholder: 'Enter text or leave empty...',
 *   onChange: v => console.log('Value:', v), // null or string
 * })
 * ```
 */
export const NullableTextInput = createNullableStringInput(TextInput)
