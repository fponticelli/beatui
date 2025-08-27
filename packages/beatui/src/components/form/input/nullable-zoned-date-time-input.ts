import { attr, emitValue, Empty, input, on, Value } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { WithTemporal } from '@/temporal/with-temporal'
import { ZonedDateTime } from '@/temporal'

export const NullableZonedDateTimeInput = (
  options: InputOptions<ZonedDateTime | null>
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
              emitValue(v => {
                if (v === '') return onChange(null)
                const dt = T.PlainDateTime.from(v)
                const tz =
                  Value.get(options.placeholder as Value<string>) ??
                  Intl.DateTimeFormat().resolvedOptions().timeZone
                return onChange(T.ZonedDateTime.from({ ...dt, timeZone: tz }))
              })
            )
          : Empty
      ),
    })
  )
}
