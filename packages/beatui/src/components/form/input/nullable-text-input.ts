import { Fragment, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { TextInput } from './text-input'
import { NullableResetAfter } from './nullable-utils'

export const emptyToNull = (value: string | null) =>
  typeof value === 'string' && value.trim() === '' ? null : value
export const nullToEmpty = (value: null | string) =>
  value == null ? '' : value

export const NullableTextInput = (options: InputOptions<null | string>) => {
  const { value, onBlur, onChange, onInput, after, disabled, ...rest } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return TextInput({
    ...rest,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
