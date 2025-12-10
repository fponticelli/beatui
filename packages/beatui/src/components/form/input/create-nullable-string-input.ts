import { Fragment, Renderable, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
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
 * @param BaseInput - The base input component (e.g., TextInput, EmailInput, PasswordInput)
 * @returns A nullable version of the input component
 *
 * @example
 * ```ts
 * export const NullableTextInput = createNullableStringInput(TextInput)
 * export const NullableEmailInput = createNullableStringInput(EmailInput)
 * ```
 */
export function createNullableStringInput(
  BaseInput: (options: InputOptions<string>) => Renderable
): (options: InputOptions<null | string>) => Renderable {
  return (options: InputOptions<null | string>) => {
    const { value, onBlur, onChange, onInput, after, disabled, ...rest } =
      options

    const ResetAfter = NullableResetAfter(value, disabled, onChange ?? onInput)

    return BaseInput({
      ...rest,
      disabled,
      value: Value.map(value, nullToEmpty),
      onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
      onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
      onBlur,
      after: after != null ? Fragment(ResetAfter, after) : ResetAfter,
    })
  }
}
