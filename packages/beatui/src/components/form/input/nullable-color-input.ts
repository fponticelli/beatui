import { Fragment, Renderable, Value } from '@tempots/dom'
import { InputOptions } from './input-options'
import { ColorInput } from './color-input'
import { NullableResetAfter } from './nullable-utils'
import { emptyToNull, nullToEmpty } from './create-nullable-string-input'

/**
 * Configuration options for the {@link NullableColorInput} component.
 *
 * Extends {@link InputOptions} for `string | null` color values with an optional
 * size property for the color swatch preview.
 */
export type NullableColorInputOptions = InputOptions<string | null> & {
  /** Size in pixels of the color swatch preview (square). @default 32 */
  size?: Value<number>
}

/**
 * A nullable variant of {@link ColorInput} for `string | null` values.
 *
 * Displays as a standard color input where `null` values show as an empty text field.
 * Includes a reset button to clear the value back to `null`. Empty strings entered
 * by the user are converted to `null` on change.
 *
 * @param options - Configuration options for the nullable color input.
 * @returns A renderable nullable color input component.
 *
 * @example
 * ```ts
 * NullableColorInput({
 *   value: prop<string | null>(null),
 *   onChange: v => console.log('Color:', v), // null or string
 * })
 * ```
 */
export const NullableColorInput = (
  options: NullableColorInputOptions
): Renderable => {
  const { value, onChange, onInput, onBlur, after, disabled, ...rest } = options

  const resetAfter = NullableResetAfter(value, disabled, onChange ?? onInput)

  return ColorInput({
    ...rest,
    disabled,
    value: Value.map(value, nullToEmpty),
    onChange: onChange != null ? v => onChange(emptyToNull(v)) : undefined,
    onInput: onInput != null ? v => onInput(emptyToNull(v)) : undefined,
    onBlur,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}
