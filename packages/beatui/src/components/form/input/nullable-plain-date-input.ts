import { PlainDate } from '../../../temporal'
import { createNullableTemporalInput } from './create-temporal-input'

/**
 * A nullable variant of {@link PlainDateInput} for `PlainDate | null` values.
 *
 * Renders a native HTML `date` input that can be cleared to `null`.
 * Created via {@link createNullableTemporalInput} with `PlainDate` serialization.
 * Includes a reset button to clear the value. Requires the Temporal polyfill.
 *
 * @param options - Standard input options for a `PlainDate | null` value.
 * @returns A renderable nullable plain date input component.
 *
 * @example
 * ```ts
 * NullablePlainDateInput({
 *   value: prop<PlainDate | null>(null),
 *   onChange: date => console.log('Date:', date?.toString() ?? 'null'),
 * })
 * ```
 */
export const NullablePlainDateInput = createNullableTemporalInput<PlainDate>({
  inputType: 'date',
  valueToString: v => v.toString(),
  parseValue: (T, v) => T.PlainDate.from(v),
})
