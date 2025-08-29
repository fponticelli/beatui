import { Fragment, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { UUIDInput } from './uuid-input'
import { emptyToNull, nullToEmpty } from './nullable-text-input'
import { NullableResetAfter } from './nullable-utils'

export const NullableUUIDInput = (options: InputOptions<string | null>) => {
  const { value, onBlur, onChange, onInput, after, disabled, ...rest } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return UUIDInput({
    ...rest,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
