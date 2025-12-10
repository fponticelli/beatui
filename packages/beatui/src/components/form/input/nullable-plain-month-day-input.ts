import { Fragment, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { WithTemporal } from '../../../temporal/with-temporal'
import { MaskInput } from './mask-input'
import { PlainMonthDay } from '../../../temporal'
import { NullableResetAfter } from './nullable-utils'

export const NullablePlainMonthDayInput = (
  options: InputOptions<PlainMonthDay | null>
) => {
  const { value, onChange, onInput, after, disabled } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange ?? onInput)

  return WithTemporal(T =>
    MaskInput({
      ...options,
      value: Value.map(value, v => v?.toString() ?? ''),
      onChange:
        onChange != null
          ? (v: string) =>
              onChange(v === '' ? null : T.PlainMonthDay.from(`--${v}`))
          : undefined,
      onInput:
        onInput != null
          ? (v: string) =>
              onInput(v === '' ? null : T.PlainMonthDay.from(`--${v}`))
          : undefined,
      mask: '99-99',
      placeholder: 'MM-DD',
      after: after != null ? Fragment(resetAfter, after) : resetAfter,
    })
  )
}
