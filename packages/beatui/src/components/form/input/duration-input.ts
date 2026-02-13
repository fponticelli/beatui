import { Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { WithTemporal } from '../../../temporal/with-temporal'
import { MaskInput } from './mask-input'
import { Duration } from '../../../temporal'
import { durationMaskConfig } from './duration-mask'

/**
 * An ISO-8601 duration input component with mask validation.
 *
 * Accepts duration strings in the format `PnYnMnDTnHnMnS` (e.g., `P1DT2H30M`).
 * Uses a custom mask that allows only valid duration characters and validates
 * the input via `Temporal.Duration.from()`. Requires the Temporal polyfill.
 *
 * @param options - Standard input options for a `Duration` value.
 * @returns A renderable duration input component.
 *
 * @example
 * ```ts
 * DurationInput({
 *   value: prop(Temporal.Duration.from('PT1H30M')),
 *   onChange: d => console.log('Duration:', d.toString()),
 * })
 * ```
 */
export const DurationInput = (options: InputOptions<Duration>) => {
  const { value, onChange } = options

  return WithTemporal(T =>
    MaskInput({
      ...options,
      value: Value.map(value, v => v.toString()),
      onChange: onChange
        ? (v: string) => onChange(T.Duration.from(v))
        : undefined,
      onInput: undefined,
      ...durationMaskConfig(T.Duration.from),
      placeholder: 'P0DT0H0M0S',
    })
  )
}
