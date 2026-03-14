import {
  attr,
  emitValue,
  emitValueAsNullableDate,
  Empty,
  input,
  on,
  Fragment,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { NullableResetAfter } from './nullable-utils'

/**
 * A nullable date input component for `Date | null` values.
 *
 * Renders a native HTML `date` input that can be cleared to `null`.
 * Includes a reset button to clear the value. Uses `valueAsDate` for
 * direct `Date` object binding.
 *
 * @param options - Standard input options for a `Date | null` value.
 * @returns A renderable nullable date input component.
 *
 * @example
 * ```ts
 * NullableDateInput({
 *   value: prop<Date | null>(null),
 *   onChange: date => console.log('Date:', date),
 * })
 * ```
 */
export const NullableDateInput = (options: InputOptions<Date | null>) => {
  const { value, onBlur, onChange, onInput, after, disabled } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange ?? onInput)

  return InputContainer({
    ...options,
    input: input.date(
      CommonInputAttributes(options),
      attr.valueAsDate(value),
      attr.class('bc-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValueAsNullableDate(onChange)) : Empty,
      onInput != null ? on.input(emitValueAsNullableDate(onInput)) : Empty
    ),
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
