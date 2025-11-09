import { Fragment, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { RatingInput } from './rating-input'
import { NullableResetAfter } from './nullable-utils'
import { ThemeColorName } from '../../../tokens'
import { ControlSize } from '../../theme/types'

export type NullableRatingInputOptions = InputOptions<number | null> & {
  max?: Value<number>
  fullColor?: Value<ThemeColorName>
  emptyColor?: Value<ThemeColorName>
  fullIcon?: Value<string>
  emptyIcon?: Value<string>
  size?: Value<ControlSize>
  rounding?: Value<number>
}

export const NullableRatingInput = (options: NullableRatingInputOptions) => {
  const { value, onChange, onBlur, after, disabled, ...rest } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange)

  return RatingInput({
    ...rest,
    // Map null -> 0 for display so the control shows as empty when null
    value: Value.map(value, v => v ?? 0),
    // Pass through numeric changes; clear button will call onChange(null)
    onChange,
    onBlur,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
