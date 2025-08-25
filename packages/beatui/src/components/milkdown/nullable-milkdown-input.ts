import { Merge, Value } from '@tempots/dom'
import { MilkdownInput, MilkdownInputOptions } from './milkdown-input'
import { emptyToNull, InputOptions, nullToEmpty } from '../form'

export type NullableMilkdownInputOptions = Merge<
  InputOptions<null | string>,
  Omit<MilkdownInputOptions, 'value' | 'onChange' | 'onBlur'>
>

export function NullableMilkdownInput(options: NullableMilkdownInputOptions) {
  const { value, onBlur, onChange, onInput, ...rest } = options

  return MilkdownInput({
    ...rest,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
  })
}
