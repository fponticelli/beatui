import { Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { TextInput } from './text-input'

export const emptyToNull = (value: string | null) =>
  typeof value === 'string' && value.trim() === '' ? null : value
export const nullToEmpty = (value: null | string) =>
  value == null ? '' : value

export const NullableTextInput = (options: InputOptions<null | string>) => {
  const { value, onBlur, onChange, onInput, ...rest } = options

  return TextInput({
    ...rest,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
  })
}
