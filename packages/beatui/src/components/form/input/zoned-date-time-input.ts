import { attr, emitValue, Empty, input, on, Value } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { WithTemporal } from '../../../temporal/with-temporal'
import { ZonedDateTime } from '../../../temporal'

/**
 * An input component for `Temporal.ZonedDateTime` values.
 *
 * Renders a `datetime-local` HTML input. The time zone is inferred from
 * the `placeholder` option or defaults to the user's local time zone via
 * `Intl.DateTimeFormat`. Requires the Temporal polyfill.
 *
 * @param options - Standard input options for a `ZonedDateTime` value.
 *   The `placeholder` option can be used to specify a time zone string.
 * @returns A renderable zoned date-time input component.
 *
 * @example
 * ```ts
 * ZonedDateTimeInput({
 *   value: prop(Temporal.Now.zonedDateTimeISO()),
 *   placeholder: 'America/New_York',
 *   onChange: zdt => console.log('ZonedDateTime:', zdt.toString()),
 * })
 * ```
 */
export const ZonedDateTimeInput = (options: InputOptions<ZonedDateTime>) => {
  const { value, onBlur, onChange } = options

  return WithTemporal(T =>
    InputContainer({
      ...options,
      input: input['datetime-local'](
        CommonInputAttributes(options),
        attr.value(Value.map(value, v => v.toJSON())),
        attr.class('bc-input'),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null
          ? on.change(
              emitValue(v => {
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
