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
import { WithTemporal } from '../../../temporal/with-temporal'
import { Instant } from '../../../temporal'
import { NullableResetAfter } from './nullable-utils'

const toLocalString = (epochMs: number) => {
  const d = new Date(epochMs)
  const y = d.getFullYear().toString().padStart(4, '0')
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const h = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

export const NullableInstantInput = (options: InputOptions<Instant | null>) => {
  const { value, onBlur, onChange, after, disabled } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return WithTemporal(T =>
    InputContainer({
      ...options,
      input: input['datetime-local'](
        CommonInputAttributes(options),
        attr.value(
          Value.map(value, v =>
            v == null ? null : toLocalString(Number(v.epochMilliseconds))
          )
        ),
        attr.class('bc-input'),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null
          ? on.change(
              emitValue(v =>
                v === ''
                  ? onChange(null)
                  : onChange(T.Instant.from(new Date(v).toISOString()))
              )
            )
          : Empty
      ),
      after: after != null ? Fragment(resetAfter, after) : resetAfter,
    })
  )
}
