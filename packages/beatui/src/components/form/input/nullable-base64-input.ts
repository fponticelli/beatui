import { Fragment, Value } from '@tempots/dom'
import { Base64Input, type Base64InputOptions } from './base64-input'
import { NullableResetAfter } from './nullable-utils'

export type NullableBase64InputOptions = Omit<
  Base64InputOptions,
  'value' | 'onChange' | 'onInput'
> & {
  value: Value<string | null>
  onChange?: (value: string | null) => void
  onInput?: (value: string | null) => void
}

export const NullableBase64Input = (options: NullableBase64InputOptions) => {
  const { value, onBlur, onChange, onInput, after, disabled, ...rest } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return Base64Input({
    ...rest,
    value: Value.map(value, v => v ?? undefined),
    onChange: onChange != null ? v => onChange(v ?? null) : undefined,
    onInput: onInput != null ? v => onInput(v ?? null) : undefined,
    onBlur,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
