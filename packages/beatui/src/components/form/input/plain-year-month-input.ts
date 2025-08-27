import { attr, emitValue, Empty, input, on, Value } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { WithTemporal } from '@/temporal/with-temporal'
import { PlainYearMonth } from '@/temporal'

export const PlainYearMonthInput = (options: InputOptions<PlainYearMonth>) => {
  const { value, onBlur, onChange } = options

  return WithTemporal(T =>
    InputContainer({
      ...options,
      input: input.month(
        CommonInputAttributes(options),
        attr.value(Value.map(value, v => v.toString())),
        attr.class('bc-input'),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null
          ? on.change(emitValue(v => onChange(T.PlainYearMonth.from(v))))
          : Empty
      ),
    })
  )
}
