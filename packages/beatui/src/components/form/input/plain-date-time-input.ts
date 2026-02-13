import { PlainDateTime } from '../../../temporal'
import { createTemporalInput } from './create-temporal-input'

/**
 * An input component for `Temporal.PlainDateTime` values.
 *
 * Renders a native HTML `datetime-local` input. Created via {@link createTemporalInput}
 * with `PlainDateTime` serialization. Requires the Temporal polyfill.
 *
 * @param options - Standard input options for a `PlainDateTime` value.
 * @returns A renderable plain date-time input component.
 *
 * @example
 * ```ts
 * PlainDateTimeInput({
 *   value: prop(Temporal.PlainDateTime.from('2024-01-15T14:30')),
 *   onChange: dt => console.log('DateTime:', dt.toString()),
 * })
 * ```
 */
export const PlainDateTimeInput = createTemporalInput<PlainDateTime>({
  inputType: 'datetime-local',
  valueToString: v => v.toJSON(),
  parseValue: (T, v) => T.PlainDateTime.from(v),
})
