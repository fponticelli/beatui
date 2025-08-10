import { attr, emitValue, Empty, html, on } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

export const ColorInput = (options: InputOptions<string>) => {
  const { value, onBlur, onChange, onInput } = options

  return InputContainer({
    baseContainer: true,
    ...options,
    input: html.input(
      attr.type('color'),
      CommonInputAttributes(options),
      attr.value(value),
      attr.class('bc-input bc-color-input'),
      onBlur != null ? on.blur(onBlur) : Empty,
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
    ),
  })
}
