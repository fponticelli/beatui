import { Fragment, Renderable } from '@tempots/dom'
import { InputOptions, mapInputOptions } from './input-options'
import { NullableResetAfter } from './nullable-utils'

/**
 * Converts empty string to null, preserving non-empty strings.
 */
export const emptyToNull = (value: string | null) =>
  typeof value === 'string' && value.trim() === '' ? null : value

/**
 * Converts null to empty string, preserving non-null strings.
 */
export const nullToEmpty = (value: null | string) =>
  value == null ? '' : value

/**
 * Factory function to create nullable string input components.
 * Eliminates duplication across nullable text-based inputs.
 *
 * @param BaseInput - The base input component (e.g., TextInput, NativeEmailInput, PasswordInput)
 * @returns A nullable version of the input component
 *
 * @example
 * ```ts
 * export const NullableTextInput = createNullableStringInput(TextInput)
 * export const NativeNullableEmailInput = createNullableStringInput(NativeEmailInput)
 * ```
 */
export function createNullableStringInput(
  BaseInput: (options: InputOptions<string>) => Renderable
): (options: InputOptions<null | string>) => Renderable {
  return (options: InputOptions<null | string>) => {
    const { after, disabled } = options
    const mapped = mapInputOptions(options, nullToEmpty, emptyToNull)

    const ResetAfter = NullableResetAfter(
      options.value,
      disabled,
      options.onChange ?? options.onInput
    )

    return BaseInput({
      ...mapped,
      after: after != null ? Fragment(ResetAfter, after) : ResetAfter,
    })
  }
}
