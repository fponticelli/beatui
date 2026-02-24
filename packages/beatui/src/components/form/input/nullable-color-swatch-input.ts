import { Fragment, Renderable, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { ColorSwatchInput } from './color-swatch-input'
import { NullableResetAfter } from './nullable-utils'
import {
  emptyToNull,
  nullToEmpty,
} from './create-nullable-string-input'

/**
 * Configuration options for the {@link NullableColorSwatchInput} component.
 *
 * Extends {@link InputOptions} for `string | null` color values with properties
 * to control the blob preview size, alpha channel support, value display, and
 * output color format.
 */
export type NullableColorSwatchInputOptions = InputOptions<string | null> & {
  /** When true, renders the formatted color value text next to the blob preview. @default false */
  displayValue?: Value<boolean>
  /** Size in pixels of the blob preview (square). @default 32 */
  size?: Value<number>
  /** Enable alpha channel support with a small opacity slider. @default false */
  withAlpha?: Value<boolean>
  /** Color space format for the displayed text label and emitted value. @default 'rgb' for display, 'hex' for emitted values */
  colorTextFormat?: Value<'hex' | 'rgb' | 'hsl' | 'hwb' | 'oklch'>
}

/**
 * A nullable variant of {@link ColorSwatchInput} for `string | null` values.
 *
 * Displays as a standard color swatch input where `null` values show as an empty
 * state. Includes a reset button to clear the value back to `null`. Empty strings
 * entered by the user are converted to `null` on change.
 *
 * @param options - Configuration options for the nullable color swatch input.
 * @returns A renderable nullable color swatch input component.
 *
 * @example
 * ```ts
 * NullableColorSwatchInput({
 *   value: prop<string | null>(null),
 *   displayValue: true,
 *   onChange: v => console.log('Color:', v), // null or string
 * })
 * ```
 */
export const NullableColorSwatchInput = (
  options: NullableColorSwatchInputOptions
): Renderable => {
  const { value, onChange, onInput, onBlur, after, disabled, ...rest } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange ?? onInput)

  return ColorSwatchInput({
    ...rest,
    disabled,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
