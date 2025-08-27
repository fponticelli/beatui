import { Value } from '@tempots/dom'
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'
import { WithTemporal } from '@/temporal/with-temporal'
import { MaskInput } from './mask-input'
import { PlainMonthDay } from '@/temporal'

export const NullablePlainMonthDayInput = (
  options: InputOptions<PlainMonthDay | null>
) => {
  const { value, onChange } = options

  return WithTemporal(T =>
    InputContainer({
      ...options,
      input: MaskInput({
        ...options,
        value: Value.map(value, v => v?.toString() ?? ''),
        onChange:
          onChange != null
            ? (v: string) =>
                onChange(v === '' ? null : T.PlainMonthDay.from(`--${v}`))
            : undefined,
        onInput: undefined,
        mask: '99-99',
        placeholder: 'MM-DD',
      }),
    })
  )
}
