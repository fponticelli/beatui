import { PlainDateTime } from '../../../temporal'
import { createNullableTemporalInput } from './create-temporal-input'

/**
 * A nullable variant of {@link PlainDateTimeInput} for `PlainDateTime | null` values.
 *
 * Renders a native HTML `datetime-local` input that can be cleared to `null`.
 * Created via {@link createNullableTemporalInput} with `PlainDateTime` serialization.
 * Includes a reset button to clear the value. Requires the Temporal polyfill.
 *
 * @param options - Standard input options for a `PlainDateTime | null` value.
 * @returns A renderable nullable plain date-time input component.
 *
 * @example
 * ```ts
 * NullablePlainDateTimeInput({
 *   value: prop<PlainDateTime | null>(null),
 *   onChange: dt => console.log('DateTime:', dt?.toString() ?? 'null'),
 * })
 * ```
 */
export const NullablePlainDateTimeInput =
  createNullableTemporalInput<PlainDateTime>({
    inputType: 'datetime-local',
    valueToString: v => v.toJSON(),
    parseValue: (T, v) => T.PlainDateTime.from(v),
  })
