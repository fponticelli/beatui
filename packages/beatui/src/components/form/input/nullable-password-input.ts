import { Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { PasswordInput } from './password-input'
import { emptyToNull, nullToEmpty } from './nullable-text-input'

export const NullablePasswordInput = (options: InputOptions<null | string>) => {
  const { value, onBlur, onChange, onInput, ...rest } = options

  return PasswordInput({
    ...rest,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
  })
}
