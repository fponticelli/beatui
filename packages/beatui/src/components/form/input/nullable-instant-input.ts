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
import { Instant } from '../../../temporal'
import { NullableResetAfter } from './nullable-utils'

const toLocalString = (epochMs: number) => {
  const d = new Date(epochMs)
  const y = d.getFullYear().toString().padStart(4, '0')
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const h = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

/**
 * A nullable variant of {@link InstantInput} for `Instant | null` values.
 *
 * Renders a `datetime-local` HTML input that can be cleared to `null`.
 * Converts `Instant` to local date-time for display and parses input back
 * via ISO string conversion. Includes a reset button to clear the value.
 * Requires the Temporal polyfill.
 *
 * @param options - Standard input options for an `Instant | null` value.
 * @returns A renderable nullable instant input component.
 *
 * @example
 * ```ts
 * NullableInstantInput({
 *   value: prop<Instant | null>(null),
 *   onChange: instant => console.log('Instant:', instant?.toString() ?? 'null'),
 * })
 * ```
 */
export const NullableInstantInput = (options: InputOptions<Instant | null>) => {
  const { value, onBlur, onChange, onInput, after, disabled } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange ?? onInput)

  return WithTemporal(T =>
    InputContainer({
      ...options,
      input: input['datetime-local'](
        CommonInputAttributes(options),
        attr.value(
          Value.map(value, v =>
            v == null ? null : toLocalString(Number(v.epochMilliseconds))
          )
        ),
        attr.class('bc-input'),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null
          ? on.change(
              emitValue(v =>
                v === ''
                  ? onChange(null)
                  : onChange(T.Instant.from(new Date(v).toISOString()))
              )
            )
          : Empty,
        onInput != null
          ? on.input(
              emitValue(v =>
                v === ''
                  ? onInput(null)
                  : onInput(T.Instant.from(new Date(v).toISOString()))
              )
            )
          : Empty
      ),
      after: after != null ? Fragment(resetAfter, after) : resetAfter,
    })
  )
}
