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
import { PlainDateTime } from '@/temporal'
import { NullableResetAfter } from './nullable-utils'

export const NullablePlainDateTimeInput = (
  options: InputOptions<PlainDateTime | null>
) => {
  const { value, onBlur, onChange, after, disabled } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return WithTemporal(T =>
    InputContainer({
      ...options,
      input: input['datetime-local'](
        CommonInputAttributes(options),
        attr.value(Value.map(value, v => v?.toJSON())),
        attr.class('bc-input'),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null
          ? on.change(
              emitValue(v =>
                v === '' ? onChange(null) : onChange(T.PlainDateTime.from(v))
              )
            )
          : Empty
      ),
      after: after != null ? Fragment(resetAfter, after) : resetAfter,
    })
  )
}
