import { attr, emitValue, Empty, html, on, Value } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'

export type TextAreaOptions = Merge<
  InputOptions<string>,
  {
    rows?: Value<number>
  }
>

export const TextArea = (options: TextAreaOptions) => {
  const { value, onBlur, onChange, onInput, rows } = options

  return InputContainer({
    ...options,
    input: html.textarea(
      CommonInputAttributes(options),
      attr.rows(rows ?? 10),
      attr.value(value),
      attr.class('bc-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
    ),
  })
}
