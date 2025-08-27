import { Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { WithTemporal } from '@/temporal/with-temporal'
import { MaskInput } from './mask-input'
import { Duration } from '@/temporal'

// Simple ISO-8601 duration text input with mask
// Format: PnYnMnDTnHnMnS (we'll provide a lenient mask and parse via Temporal.Duration.from)

export const DurationInput = (options: InputOptions<Duration>) => {
  const { value, onChange } = options

  return WithTemporal(T =>
    MaskInput({
      ...options,
      value: Value.map(value, v => v.toString()),
      onChange: onChange
        ? (v: string) => onChange(T.Duration.from(v))
        : undefined,
      onInput: undefined,
      mask: null,
      placeholder: 'P0DT0H0M0S',
    })
  )
}
