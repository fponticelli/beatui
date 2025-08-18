import {
  attr,
  emitValue,
  emitValueAsNumber,
  Empty,
  input,
  on,
  Value,
  computedOf,
  aria,
  Use,
  html,
  Fragment,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { Icon } from '../../data/icon'
import { BeatUII18n } from '@/beatui-i18n'
import { Stack } from '@/components/layout'

export type NumberInputOptions = Merge<
  InputOptions<number>,
  {
    step?: Value<number>
    min?: Value<number>
    max?: Value<number>
  }
>

export const NumberInput = (options: NumberInputOptions) => {
  const { value, step, min, max, onBlur, onChange, onInput, after } = options

  // Create stepper buttons if step is provided
  const stepperButtons =
    step != null
      ? Use(BeatUII18n, t => {
          const canDecrement = computedOf(
            value,
            min
          )((val, minVal) => {
            if (minVal == null) return true
            return (val ?? 0) > minVal
          })

          const canIncrement = computedOf(
            value,
            max
          )((val, maxVal) => {
            if (maxVal == null) return true
            return (val ?? 0) < maxVal
          })

          const handleDecrement = () => {
            const current = Value.get(value) ?? 0
            const stepVal = Value.get(step)
            const newValue = current - stepVal
            const minVal = min != null ? Value.get(min) : undefined

            if (minVal != null && newValue < minVal) return

            // Call onChange to update the value
            if (onChange) onChange(newValue)
          }

          const handleIncrement = () => {
            const current = Value.get(value) ?? 0
            const stepVal = Value.get(step)
            const newValue = current + stepVal
            const maxVal = max != null ? Value.get(max) : undefined

            if (maxVal != null && newValue > maxVal) return

            // Call onChange to update the value
            if (onChange) onChange(newValue)
          }

          return Stack(
            attr.class('bc-number-input-steppers'),
            html.button(
              attr.class(
                'bc-number-input-steppers-button bc-number-input-steppers-button--increment'
              ),
              attr.disabled(
                computedOf(
                  canIncrement,
                  options.disabled ?? false
                )((canInc, disabled) => !canInc || disabled)
              ),
              on.click(handleIncrement),
              aria.label(t.$.incrementValue),
              Icon({ icon: 'line-md:plus', size: 'xs' })
            ),
            html.button(
              attr.class(
                'bc-number-input-steppers-button bc-number-input-steppers-button--decrement'
              ),

              attr.disabled(
                computedOf(
                  canDecrement,
                  options.disabled ?? false
                )((canDec, disabled) => !canDec || disabled)
              ),
              on.click(handleDecrement),
              aria.label(t.$.decrementValue),
              Icon({ icon: 'line-md:minus', size: 'xs' })
            )
          )
        })
      : null

  const afterContent =
    after != null && stepperButtons != null
      ? Fragment(stepperButtons, after)
      : (after ?? stepperButtons)

  return InputContainer({
    ...options,
    input: input.number(
      CommonInputAttributes(options),
      attr.valueAsNumber(value),
      attr.step(step),
      attr.min(min),
      attr.max(max),
      attr.class('bc-input bc-number-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValueAsNumber(onChange)) : Empty,
      onInput != null ? on.input(emitValueAsNumber(onInput)) : Empty
    ),
    after: afterContent,
  })
}
