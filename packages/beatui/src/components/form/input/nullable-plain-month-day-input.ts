import { Fragment, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { WithTemporal } from '../../../temporal/with-temporal'
import { MaskInput } from './mask-input'
import { PlainMonthDay } from '../../../temporal'
import { NullableResetAfter } from './nullable-utils'

/**
 * A nullable variant of {@link PlainMonthDayInput} for `PlainMonthDay | null` values.
 *
 * Uses a masked text input with the pattern `MM-DD` that can be cleared to `null`.
 * Empty input is converted to `null`. Includes a reset button to clear the value.
 * Requires the Temporal polyfill.
 *
 * @param options - Standard input options for a `PlainMonthDay | null` value.
 * @returns A renderable nullable plain month-day input component.
 *
 * @example
 * ```ts
 * NullablePlainMonthDayInput({
 *   value: prop<PlainMonthDay | null>(null),
 *   onChange: md => console.log('MonthDay:', md?.toString() ?? 'null'),
 * })
 * ```
 */
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
