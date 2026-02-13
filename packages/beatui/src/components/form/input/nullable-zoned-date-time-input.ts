import {
  attr,
  emitValue,
  Empty,
  input,
  on,
  Value,
  Fragment,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { WithTemporal } from '../../../temporal/with-temporal'
import { ZonedDateTime } from '../../../temporal'
import { NullableResetAfter } from './nullable-utils'

/**
 * A nullable variant of {@link ZonedDateTimeInput} for `ZonedDateTime | null` values.
 *
 * Renders a `datetime-local` HTML input that can be cleared to `null`. The time
 * zone is inferred from the `placeholder` option or defaults to the user's local
 * time zone. Includes a reset button to clear the value. Requires the Temporal polyfill.
 *
 * @param options - Standard input options for a `ZonedDateTime | null` value.
 *   The `placeholder` option can be used to specify a time zone string.
 * @returns A renderable nullable zoned date-time input component.
 *
 * @example
 * ```ts
 * NullableZonedDateTimeInput({
 *   value: prop<ZonedDateTime | null>(null),
 *   placeholder: 'America/New_York',
 *   onChange: zdt => console.log('ZonedDateTime:', zdt?.toString() ?? 'null'),
 * })
 * ```
 */
export const NullableZonedDateTimeInput = (
  options: InputOptions<ZonedDateTime | null>
) => {
  const { value, onBlur, onChange, onInput, after, disabled } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange ?? onInput)

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
          : Empty,
        onInput != null
          ? on.input(
              emitValue(v => {
                if (v === '') return onInput(null)
                const dt = T.PlainDateTime.from(v)
                const tz =
                  Value.get(options.placeholder as Value<string>) ??
                  Intl.DateTimeFormat().resolvedOptions().timeZone
                return onInput(T.ZonedDateTime.from({ ...dt, timeZone: tz }))
              })
            )
          : Empty
      ),
      after: after != null ? Fragment(resetAfter, after) : resetAfter,
    })
  )
}
