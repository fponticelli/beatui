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
import { PlainTime } from '@/temporal'
import { NullableResetAfter } from './nullable-utils'

export const NullablePlainTimeInput = (
  options: InputOptions<PlainTime | null>
) => {
  const { value, onBlur, onChange, after, disabled } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return WithTemporal(T =>
    InputContainer({
      ...options,
      input: input.time(
        CommonInputAttributes(options),
        attr.value(Value.map(value, v => v?.toString())),
        attr.class('bc-input'),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null
          ? on.change(
              emitValue(v =>
                v === '' ? onChange(null) : onChange(T.PlainTime.from(v))
              )
            )
          : Empty
      ),
      after: after != null ? Fragment(resetAfter, after) : resetAfter,
    })
  )
}
