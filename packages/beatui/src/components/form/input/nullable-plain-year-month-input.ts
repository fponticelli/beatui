import { PlainYearMonth } from '../../../temporal'
import { createNullableTemporalInput } from './create-temporal-input'

/**
 * A nullable variant of {@link PlainYearMonthInput} for `PlainYearMonth | null` values.
 *
 * Renders a native HTML `month` input that can be cleared to `null`.
 * Created via {@link createNullableTemporalInput} with `PlainYearMonth` serialization.
 * Includes a reset button to clear the value. Requires the Temporal polyfill.
 *
 * @param options - Standard input options for a `PlainYearMonth | null` value.
 * @returns A renderable nullable plain year-month input component.
 *
 * @example
 * ```ts
 * NullablePlainYearMonthInput({
 *   value: prop<PlainYearMonth | null>(null),
 *   onChange: ym => console.log('YearMonth:', ym?.toString() ?? 'null'),
 * })
 * ```
 */
export const NullablePlainYearMonthInput =
  createNullableTemporalInput<PlainYearMonth>({
    inputType: 'month',
    valueToString: v => v.toString(),
    parseValue: (T, v) => T.PlainYearMonth.from(v),
  })
