import { attr, emitValue, Empty, input, on } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

export const TextInput = (options: InputOptions<string>) => {
  const { value, onBlur, onChange, onInput } = options

  return InputContainer({
    ...options,
    input: input.text(
      CommonInputAttributes(options),
      attr.value(value),
      attr.class('bc-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
    ),
  })
}
