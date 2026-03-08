import { Fragment, Value } from '@tempots/dom'
import { InputOptions, mapInputOptions } from './input-options'
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
  /** Color name for filled rating icons. @default 'yellow' */
  fullColor?: Value<ThemeColorName>
  /** Color name for empty rating icons. @default 'neutral' */
  emptyColor?: Value<ThemeColorName>
  /** Icon identifier for active (filled) rating items. @default 'line-md:star-alt-filled' */
  activeIcon?: Value<string>
  /** Icon identifier for inactive (empty) rating items. @default 'line-md:star-alt' */
  inactiveIcon?: Value<string>
  /** Size of the rating icons. @default 'md' */
  size?: Value<ControlSize>
  /** Rounding precision for fractional ratings (e.g., `0.5` for half stars). @default 1 */
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
  const { after, disabled } = options
  const mapped = mapInputOptions<number | null, number>(
    options,
    v => v ?? 0,
    v => v
  )

  const resetAfter = NullableResetAfter(
    options.value,
    disabled,
    options.onChange ?? options.onInput
  )

  return RatingInput({
    ...mapped,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
