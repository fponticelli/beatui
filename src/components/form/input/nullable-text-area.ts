import { attr, emitValue, Empty, html, on, Value } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { emptyToNull, nullToEmpty } from './nullable-text-input'

export type NullableTextAreaOptions = Merge<
  InputOptions<null | string>,
  {
    rows?: Value<number>
  }
>

export const NullableTextArea = (options: NullableTextAreaOptions) => {
  const { value, onBlur, onChange, onInput, rows } = options

  return InputContainer({
    ...options,
    input: html.textarea(
      CommonInputAttributes(options),
      attr.rows(rows ?? 10),
      attr.value(Value.map(value, nullToEmpty)),
      attr.class('focus:outline-none bg-transparent'),
      attr.class('w-full'),
      onBlur != null ? on.blur(onBlur) : Empty,
      onChange != null
        ? on.change(emitValue(v => onChange(emptyToNull(v))))
        : Empty,
      onInput != null
        ? on.input(emitValue(v => onInput(emptyToNull(v))))
        : Empty
    ),
  })
}
