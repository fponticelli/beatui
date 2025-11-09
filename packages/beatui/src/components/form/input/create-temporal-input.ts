import {
  attr,
  emitValue,
  Empty,
  Fragment,
  input,
  on,
  Renderable,
  Value,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { WithTemporal } from '../../../temporal/with-temporal'
import { NullableResetAfter } from './nullable-utils'
import type { BeatUITemporal } from '../../../temporal'

/**
 * Configuration for creating a Temporal input component.
 */
export type TemporalInputConfig<T> = {
  /**
   * The HTML input type (e.g., 'date', 'time', 'datetime-local', 'month')
   */
  inputType: 'date' | 'time' | 'datetime-local' | 'month'

  /**
   * Function to convert the Temporal value to a string for the input
   */
  valueToString: (value: T) => string

  /**
   * Function to parse the input string value using Temporal API
   */
  parseValue: (temporal: BeatUITemporal, value: string) => T
}

/**
 * Factory function to create Temporal input components.
 * Eliminates duplication across PlainDate, PlainTime, PlainDateTime, PlainYearMonth, etc.
 *
 * @param config - Configuration for the Temporal input
 * @returns A Temporal input component
 *
 * @example
 * ```ts
 * export const PlainDateInput = createTemporalInput<PlainDate>({
 *   inputType: 'date',
 *   valueToString: v => v.toString(),
 *   parseValue: (T, v) => T.PlainDate.from(v),
 * })
 * ```
 */
export function createTemporalInput<T>(
  config: TemporalInputConfig<T>
): (options: InputOptions<T>) => Renderable {
  return (options: InputOptions<T>) => {
    const { value, onBlur, onChange } = options

    return WithTemporal(T =>
      InputContainer({
        ...options,
        input: input[config.inputType](
          CommonInputAttributes(options),
          attr.value(Value.map(value, config.valueToString)),
          attr.class('bc-input'),
          onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
          onChange != null
            ? on.change(emitValue(v => onChange(config.parseValue(T, v))))
            : Empty
        ),
      })
    )
  }
}

/**
 * Factory function to create nullable Temporal input components.
 * Eliminates duplication across nullable Temporal inputs.
 *
 * @param config - Configuration for the Temporal input
 * @returns A nullable Temporal input component
 *
 * @example
 * ```ts
 * export const NullablePlainDateInput = createNullableTemporalInput<PlainDate>({
 *   inputType: 'date',
 *   valueToString: v => v.toString(),
 *   parseValue: (T, v) => T.PlainDate.from(v),
 * })
 * ```
 */
export function createNullableTemporalInput<T>(
  config: TemporalInputConfig<T>
): (options: InputOptions<T | null>) => Renderable {
  return (options: InputOptions<T | null>) => {
    const { value, onBlur, onChange, after, disabled } = options

    const resetAfter = NullableResetAfter(value, disabled, onChange)

    return WithTemporal(T =>
      InputContainer({
        ...options,
        input: input[config.inputType](
          CommonInputAttributes(options),
          attr.value(
            Value.map(value, v => (v == null ? '' : config.valueToString(v)))
          ),
          attr.class('bc-input'),
          onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
          onChange != null
            ? on.change(
                emitValue(v =>
                  v === '' ? onChange(null) : onChange(config.parseValue(T, v))
                )
              )
            : Empty
        ),
        after: after != null ? Fragment(resetAfter, after) : resetAfter,
      })
    )
  }
}
