import {
  attr,
  emitValueAsNumber,
  Empty,
  on,
  Value,
  html,
  Fragment,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { NullableResetAfter } from './nullable-utils'

export type SliderInputOptions = Merge<
  InputOptions<number>,
  {
    step?: Value<number>
    min?: Value<number>
    max?: Value<number>
  }
>

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

export type NullableSliderInputOptions = Merge<
  InputOptions<number | null>,
  {
    step?: Value<number>
    min?: Value<number>
    max?: Value<number>
  }
>

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

  return InputContainer(
    {
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
    },
    // Ensure container grows input naturally
    Fragment()
  )
}
