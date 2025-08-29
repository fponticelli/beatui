import { Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { ColorInput } from './color-input'
import { emptyToNull, nullToEmpty } from './nullable-text-input'

export const NullableColorInput = (options: InputOptions<string | null>) => {
  const { value, onBlur, onChange, onInput, ...rest } = options

  return ColorInput({
    ...rest,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
  })
}
