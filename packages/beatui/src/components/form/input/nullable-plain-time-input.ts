import { PlainTime } from '../../../temporal'
import { createNullableTemporalInput } from './create-temporal-input'

/**
 * A nullable variant of {@link PlainTimeInput} for `PlainTime | null` values.
 *
 * Renders a native HTML `time` input that can be cleared to `null`.
 * Created via {@link createNullableTemporalInput} with `PlainTime` serialization.
 * Includes a reset button to clear the value. Requires the Temporal polyfill.
 *
 * @param options - Standard input options for a `PlainTime | null` value.
 * @returns A renderable nullable plain time input component.
 *
 * @example
 * ```ts
 * NullablePlainTimeInput({
 *   value: prop<PlainTime | null>(null),
 *   onChange: time => console.log('Time:', time?.toString() ?? 'null'),
 * })
 * ```
 */
export const NullablePlainTimeInput = createNullableTemporalInput<PlainTime>({
  inputType: 'time',
  valueToString: v => v.toString(),
  parseValue: (T, v) => T.PlainTime.from(v),
})
