import { Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { WithTemporal } from '../../../temporal/with-temporal'
import { MaskInput } from './mask-input'
import { PlainMonthDay } from '../../../temporal'

/**
 * An input component for `Temporal.PlainMonthDay` values.
 *
 * Uses a masked text input with the pattern `MM-DD`. The value is displayed
 * without the leading `--` prefix and parsed back with it. Requires the
 * Temporal polyfill.
 *
 * @param options - Standard input options for a `PlainMonthDay` value.
 * @returns A renderable plain month-day input component.
 *
 * @example
 * ```ts
 * PlainMonthDayInput({
 *   value: prop(Temporal.PlainMonthDay.from('--12-25')),
 *   onChange: md => console.log('MonthDay:', md.toString()),
 * })
 * ```
 */
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
