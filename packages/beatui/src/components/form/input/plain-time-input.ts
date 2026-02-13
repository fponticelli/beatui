import { PlainTime } from '../../../temporal'
import { createTemporalInput } from './create-temporal-input'

/**
 * An input component for `Temporal.PlainTime` values.
 *
 * Renders a native HTML `time` input. Created via {@link createTemporalInput}
 * with `PlainTime` serialization. Requires the Temporal polyfill.
 *
 * @param options - Standard input options for a `PlainTime` value.
 * @returns A renderable plain time input component.
 *
 * @example
 * ```ts
 * PlainTimeInput({
 *   value: prop(Temporal.PlainTime.from('14:30')),
 *   onChange: time => console.log('Time:', time.toString()),
 * })
 * ```
 */
export const PlainTimeInput = createTemporalInput<PlainTime>({
  inputType: 'time',
  valueToString: v => v.toString(),
  parseValue: (T, v) => T.PlainTime.from(v),
})
