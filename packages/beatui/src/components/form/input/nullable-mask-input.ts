import { Merge, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { MaskInput, MaskInputOptions } from './mask-input'
import { emptyToNull, nullToEmpty } from './nullable-text-input'

export type NullableMaskInputOptions = Merge<
  InputOptions<null | string>,
  Omit<MaskInputOptions, 'value' | 'onChange' | 'onInput'>
>

export const NullableMaskInput = (options: NullableMaskInputOptions) => {
  const { value, onBlur, onChange, onInput, ...rest } = options

  return MaskInput({
    ...rest,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
  })
}
