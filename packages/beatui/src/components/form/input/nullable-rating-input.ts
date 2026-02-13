import { Fragment, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { RatingInput } from './rating-input'
import { NullableResetAfter } from './nullable-utils'
import { ThemeColorName } from '../../../tokens'
import { ControlSize } from '../../theme/types'

/**
 * Options for the {@link NullableRatingInput} component.
 * Extends standard `InputOptions` for `number | null` values with rating-specific settings.
 */
export type NullableRatingInputOptions = InputOptions<number | null> & {
  /**
   * Maximum number of rating stars/items.
   * @default 5
   */
  max?: Value<number>
  /** Color name for filled rating icons. */
  fullColor?: Value<ThemeColorName>
  /** Color name for empty rating icons. */
  emptyColor?: Value<ThemeColorName>
  /** Icon identifier for filled rating items. */
  fullIcon?: Value<string>
  /** Icon identifier for empty rating items. */
  emptyIcon?: Value<string>
  /** Size of the rating icons. */
  size?: Value<ControlSize>
  /** Rounding precision for fractional ratings (e.g., `0.5` for half stars). */
  rounding?: Value<number>
}

/**
 * A nullable variant of {@link RatingInput} for `number | null` values.
 *
 * Displays as a standard rating input where `null` values show as zero stars.
 * Includes a reset button to clear the value back to `null`. Supports all
 * rating options like custom icons, colors, and rounding.
 *
 * @param options - Configuration options for the nullable rating input.
 * @returns A renderable nullable rating input component.
 *
 * @example
 * ```ts
 * NullableRatingInput({
 *   value: prop<number | null>(null),
 *   max: 5,
 *   onChange: v => console.log('Rating:', v), // null or number
 * })
 * ```
 */
export const NullableRatingInput = (options: NullableRatingInputOptions) => {
  const { value, onChange, onInput, onBlur, after, disabled, ...rest } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange ?? onInput)

  return RatingInput({
    ...rest,
    // Map null -> 0 for display so the control shows as empty when null
    value: Value.map(value, v => v ?? 0),
    // Pass through numeric changes; clear button will call onChange(null)
    onChange,
    onInput,
    onBlur,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
