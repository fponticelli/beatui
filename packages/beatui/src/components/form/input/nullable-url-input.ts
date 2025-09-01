import { Fragment, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { UrlInput } from './url-input'
import { emptyToNull, nullToEmpty } from './nullable-text-input'
import { NullableResetAfter } from './nullable-utils'

export const NullableUrlInput = (options: InputOptions<null | string>) => {
  const { value, onBlur, onChange, onInput, after, disabled, ...rest } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return UrlInput({
    ...rest,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
