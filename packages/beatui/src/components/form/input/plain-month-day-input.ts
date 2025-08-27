import { Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { WithTemporal } from '@/temporal/with-temporal'
import { MaskInput } from './mask-input'
import { PlainMonthDay } from '@/temporal'

export const PlainMonthDayInput = (options: InputOptions<PlainMonthDay>) => {
  const { value, onChange } = options

  return WithTemporal(T =>
    MaskInput({
      ...options,
      // Map Temporal value to MM-DD string
      value: Value.map(value, v => v.toString()),
      onChange:
        onChange != null
          ? (v: string) => onChange(T.PlainMonthDay.from(`--${v}`))
          : undefined,
      onInput: undefined,
      mask: '99-99',
      placeholder: 'MM-DD',
    })
  )
}
