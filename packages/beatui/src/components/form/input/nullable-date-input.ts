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
