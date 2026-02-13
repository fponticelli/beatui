import { Fragment, Merge, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { MaskInput, MaskInputOptions } from './mask-input'
import { emptyToNull, nullToEmpty } from './nullable-text-input'
import { NullableResetAfter } from './nullable-utils'

/**
 * Options for the {@link NullableMaskInput} component.
 * Merges nullable string `InputOptions` with `MaskInputOptions` (excluding value/change handlers).
 */
export type NullableMaskInputOptions = Merge<
  InputOptions<null | string>,
  Omit<MaskInputOptions, 'value' | 'onChange' | 'onInput'>
>

/**
 * A nullable variant of {@link MaskInput} for `string | null` values.
 *
 * Empty strings are converted to `null` on change, and `null` values are
 * displayed as empty strings. Includes a reset button to clear the value.
 * Supports all mask configuration options from `MaskInputOptions`.
 *
 * @param options - Configuration options for the nullable mask input.
 * @returns A renderable nullable mask input component.
 *
 * @example
 * ```ts
 * NullableMaskInput({
 *   value: prop<string | null>(null),
 *   mask: '(999) 999-9999',
 *   placeholder: '(___) ___-____',
 *   onChange: v => console.log('Phone:', v), // null or string
 * })
 * ```
 */
export const NullableMaskInput = (options: NullableMaskInputOptions) => {
  const { value, onBlur, onChange, onInput, after, disabled, ...rest } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange ?? onInput)

  return MaskInput({
    ...rest,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
