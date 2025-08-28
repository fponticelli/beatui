import { Fragment, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { emptyToNull, nullToEmpty } from './nullable-text-input'
import { TextArea } from './text-area'
import { NullableResetAfter } from './nullable-utils'

export type NullableTextAreaOptions = Merge<
  InputOptions<null | string>,
  {
    rows?: Value<number>
  }
>

export const NullableTextArea = (options: NullableTextAreaOptions) => {
  const { value, onBlur, onChange, onInput, after, disabled, ...rest } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return TextArea({
    ...rest,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
