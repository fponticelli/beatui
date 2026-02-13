import { PlainDate } from '../../../temporal'
import { createTemporalInput } from './create-temporal-input'

/**
 * An input component for `Temporal.PlainDate` values.
 *
 * Renders a native HTML `date` input. Created via {@link createTemporalInput}
 * with `PlainDate` serialization. Requires the Temporal polyfill.
 *
 * @param options - Standard input options for a `PlainDate` value.
 * @returns A renderable plain date input component.
 *
 * @example
 * ```ts
 * PlainDateInput({
 *   value: prop(Temporal.PlainDate.from('2024-01-15')),
 *   onChange: date => console.log('Date:', date.toString()),
 * })
 * ```
 */
export const PlainDateInput = createTemporalInput<PlainDate>({
  inputType: 'date',
  valueToString: v => v.toString(),
  parseValue: (T, v) => T.PlainDate.from(v),
})
