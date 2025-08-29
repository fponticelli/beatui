import { Fragment, Merge, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { MaskInput, MaskInputOptions } from './mask-input'
import { emptyToNull, nullToEmpty } from './nullable-text-input'
import { NullableResetAfter } from './nullable-utils'

export type NullableMaskInputOptions = Merge<
  InputOptions<null | string>,
  Omit<MaskInputOptions, 'value' | 'onChange' | 'onInput'>
>

export const NullableMaskInput = (options: NullableMaskInputOptions) => {
  const { value, onBlur, onChange, onInput, after, disabled, ...rest } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return MaskInput({
    ...rest,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
