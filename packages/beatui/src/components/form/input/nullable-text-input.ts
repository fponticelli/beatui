import { attr, emitValue, Empty, input, on, Value } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

export const emptyToNull = (value: string | null) =>
  typeof value === 'string' && value.trim() === '' ? null : value
export const nullToEmpty = (value: null | string) =>
  value == null ? '' : value

export const NullableTextInput = (options: InputOptions<null | string>) => {
  const { value, onBlur, onChange, onInput, ...rest } = options

  return InputContainer({
    ...rest,
    input: input.text(
      CommonInputAttributes(rest),
      attr.value(Value.map(value, nullToEmpty)),
      attr.class('bc-input'),
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
