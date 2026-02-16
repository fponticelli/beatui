import { attr, emitValueAsNumber, Empty, on, Value, html } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { NullableResetAfter } from './nullable-utils'

/**
 * Configuration options for the {@link SliderInput} component.
 *
 * Extends {@link InputOptions} for numeric values with properties to control the
 * slider range boundaries and step increment.
 */
export type SliderInputOptions = Merge<
  InputOptions<number>,
  {
    /** Step increment between valid values on the slider */
    step?: Value<number>
    /** Minimum value of the slider range */
    min?: Value<number>
    /** Maximum value of the slider range */
    max?: Value<number>
  }
>

/**
 * A range slider input component wrapping a native `<input type="range">` element.
 *
 * Renders a styled range slider inside an {@link InputContainer} with support for
 * reactive min, max, and step values. The slider value is maintained as a number
 * and emitted through the standard onChange/onInput/onBlur callbacks.
 *
 * @param options - Configuration options for the slider input
 * @returns A styled range slider element wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { SliderInput } from '@tempots/beatui'
 *
 * const volume = prop(50)
 * SliderInput({
 *   value: volume,
 *   onChange: volume.set,
 *   min: 0,
 *   max: 100,
 *   step: 1,
 * })
 * ```
 *
 * @example
 * ```ts
 * // Fine-grained slider with decimal steps
 * SliderInput({
 *   value: prop(0.5),
 *   onInput: (v) => console.log('Value:', v),
 *   min: 0,
 *   max: 1,
 *   step: 0.01,
 * })
 * ```
 */
export const SliderInput = (options: SliderInputOptions) => {
  const { value, step, min, max, onBlur, onChange, onInput } = options

  return InputContainer({
    ...options,
    // Make sure clicks anywhere focus the range input
    focusableSelector: 'input[type="range"]',
    input: html.input(
      attr.type('range'),
      CommonInputAttributes(options),
      attr.min(min),
      attr.max(max),
      attr.step(step),
      // Using value as number to keep it in sync
      attr.valueAsNumber(value),
      attr.class('bc-input bc-slider-input'),
      onBlur != null ? on.blur(emitValueAsNumber(onBlur)) : Empty,
      onChange != null ? on.change(emitValueAsNumber(onChange)) : Empty,
      onInput != null ? on.input(emitValueAsNumber(onInput)) : Empty
    ),
  })
}

/**
 * Configuration options for the {@link NullableSliderInput} component.
 *
 * Similar to {@link SliderInputOptions} but accepts `null` as a valid value,
 * representing an unset state. The slider visually defaults to the minimum value
 * (or 0) when the value is null.
 */
export type NullableSliderInputOptions = Merge<
  InputOptions<number | null>,
  {
    /** Step increment between valid values on the slider */
    step?: Value<number>
    /** Minimum value of the slider range */
    min?: Value<number>
    /** Maximum value of the slider range */
    max?: Value<number>
  }
>

/**
 * A nullable range slider input that supports an unset (null) state with a reset button.
 *
 * Behaves like {@link SliderInput} but allows a `null` value to represent "not set".
 * When the value is null, the slider thumb visually rests at the minimum position
 * (or 0 if no min is specified). A reset button appears when the value is non-null
 * and the input is not disabled, allowing the user to clear back to null.
 *
 * @param options - Configuration options for the nullable slider input
 * @returns A styled range slider element with optional reset button, wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { NullableSliderInput } from '@tempots/beatui'
 *
 * const brightness = prop<number | null>(null)
 * NullableSliderInput({
 *   value: brightness,
 *   onChange: brightness.set,
 *   min: 0,
 *   max: 100,
 *   step: 5,
 * })
 * ```
 */
export const NullableSliderInput = (options: NullableSliderInputOptions) => {
  const { value, step, min, max, onBlur, onChange, onInput } = options

  // When value is null, present the slider at min (or 0 if not provided),
  // but keep controller value as null until the user moves it.
  const effectiveValue = Value.map(value, v => {
    if (v != null) return v as number
    // prefer provided min else 0
    const minVal = min != null ? Value.get(min) : undefined
    return typeof minVal === 'number' ? minVal : 0
  })

  const resetAfter = NullableResetAfter(
    value,
    options.disabled,
    onChange ?? onInput
  )

  return InputContainer({
    ...options,
    focusableSelector: 'input[type="range"]',
    after: resetAfter,
    input: html.input(
      attr.type('range'),
      CommonInputAttributes(options),
      attr.min(min),
      attr.max(max),
      attr.step(step),
      attr.valueAsNumber(effectiveValue),
      attr.class('bc-input bc-slider-input'),
      onBlur != null ? on.blur(emitValueAsNumber(onBlur)) : Empty,
      onChange != null
        ? on.change(
            emitValueAsNumber(n => {
              onChange(n as number)
            })
          )
        : Empty,
      onInput != null
        ? on.input(
            emitValueAsNumber(n => {
              onInput(n as number)
            })
          )
        : Empty
    ),
  })
}
