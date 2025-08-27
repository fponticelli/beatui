import { InputOptions } from './input-options'
import { WithTemporal } from '@/temporal/with-temporal'
import { MaskInput } from './mask-input'
import type { Duration } from '@/temporal/types'
import { Value } from '@tempots/dom'

export const NullableDurationInput = (
  options: InputOptions<Duration | null>
) => {
  const { value, onChange } = options

  return WithTemporal(T =>
    MaskInput({
      ...options,
      value: Value.map(value, v => v?.toString() ?? ''),
      onChange: onChange
        ? (v: string) => onChange(v === '' ? null : T.Duration.from(v))
        : undefined,
      onInput: undefined,
      mask: null,
      placeholder: 'P0DT0H0M0S',
    })
  )
}
