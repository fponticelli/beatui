import {
  attr,
  emitValue,
  Empty,
  input,
  on,
  Value,
  Fragment,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { WithTemporal } from '@/temporal/with-temporal'
import { PlainDate } from '@/temporal'
import { NullableResetAfter } from './nullable-utils'

export const NullablePlainDateInput = (
  options: InputOptions<PlainDate | null>
) => {
  const { value, onBlur, onChange, after, disabled } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return WithTemporal(T =>
    InputContainer({
      ...options,
      input: input.date(
        CommonInputAttributes(options),
        attr.value(Value.map(value, v => v?.toString() ?? '')),
        attr.class('bc-input'),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null
          ? on.change(
              emitValue(v =>
                v === '' ? onChange(null) : onChange(T.PlainDate.from(v))
              )
            )
          : Empty
      ),
      after: after != null ? Fragment(resetAfter, after) : resetAfter,
    })
  )
}
