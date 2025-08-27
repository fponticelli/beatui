import { attr, emitValue, Empty, input, on, Value } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { WithTemporal } from '@/temporal/with-temporal'
import { PlainDateTime } from '@/temporal'

export const NullablePlainDateTimeInput = (
  options: InputOptions<PlainDateTime | null>
) => {
  const { value, onBlur, onChange } = options

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
    })
  )
}
