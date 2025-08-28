import { InputOptions } from './input-options'
import { WithTemporal } from '@/temporal/with-temporal'
import { MaskInput } from './mask-input'
import type { Duration } from '@/temporal/types'
import { Fragment, Value } from '@tempots/dom'
import { durationMaskConfig } from './duration-mask'
import { NullableResetAfter } from './nullable-utils'

export const NullableDurationInput = (
  options: InputOptions<Duration | null>
) => {
  const { value, onChange, after, disabled } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return WithTemporal(T =>
    MaskInput({
      ...options,
      value: Value.map(value, v => v?.toString() ?? ''),
      onChange: onChange
        ? (v: string) => onChange(v === '' ? null : T.Duration.from(v))
        : undefined,
      onInput: undefined,
      ...durationMaskConfig(T.Duration.from),
      placeholder: 'P0DT0H0M0S',
      after: after != null ? Fragment(resetAfter, after) : resetAfter,
    })
  )
}
