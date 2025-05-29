import {
  attr,
  emitValue,
  emitValueAsNullableDate,
  Empty,
  input,
  on,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

export const NullableDateInput = (options: InputOptions<Date | null>) => {
  const { value, onBlur, onChange } = options

  return InputContainer({
    ...options,
    input: input.date(
      CommonInputAttributes(options),
      attr.valueAsDate(value),
      attr.class('focus:outline-none bg-transparent'),
      attr.class('w-full'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValueAsNullableDate(onChange)) : Empty
    ),
  })
}
