import {
  attr,
  emitValue,
  emitValueAsDate,
  Empty,
  input,
  on,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

export const DateInput = (options: InputOptions<Date>) => {
  const { value, onBlur, onChange } = options

  return InputContainer({
    ...options,
    input: input.date(
      CommonInputAttributes(options),
      attr.valueAsDate(value),
      attr.class('bc-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValueAsDate(onChange)) : Empty
    ),
  })
}
