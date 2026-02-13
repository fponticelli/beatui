import { PlainYearMonth } from '../../../temporal'
import { createTemporalInput } from './create-temporal-input'

/**
 * An input component for `Temporal.PlainYearMonth` values.
 *
 * Renders a native HTML `month` input. Created via {@link createTemporalInput}
 * with `PlainYearMonth` serialization. Requires the Temporal polyfill.
 *
 * @param options - Standard input options for a `PlainYearMonth` value.
 * @returns A renderable plain year-month input component.
 *
 * @example
 * ```ts
 * PlainYearMonthInput({
 *   value: prop(Temporal.PlainYearMonth.from('2024-01')),
 *   onChange: ym => console.log('YearMonth:', ym.toString()),
 * })
 * ```
 */
export const PlainYearMonthInput = createTemporalInput<PlainYearMonth>({
  inputType: 'month',
  valueToString: v => v.toString(),
  parseValue: (T, v) => T.PlainYearMonth.from(v),
})
