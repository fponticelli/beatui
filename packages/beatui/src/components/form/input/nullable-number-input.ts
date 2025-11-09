import {
  attr,
  emitValue,
  Empty,
  input,
  on,
  Value,
  computedOf,
  aria,
  html,
  Fragment,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { Icon } from '../../data/icon'
import { defaultMessages } from '../../../beatui-i18n'
import { Stack } from '../../layout'
import { NullableResetAfter } from './nullable-utils'

export type NullableNumberInputOptions = Merge<
  InputOptions<number | null>,
  {
    step?: Value<number>
    min?: Value<number>
    max?: Value<number>
  }
>

const strToNumberOrNull = (v: string): number | null => {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

export const NullableNumberInput = (options: NullableNumberInputOptions) => {
  const { value, step, min, max, onBlur, onChange, onInput, after } = options

  // Helper function to clamp within min/max
  const clampValue = (val: number): number => {
    const minVal = min != null ? Value.get(min) : undefined
    const maxVal = max != null ? Value.get(max) : undefined
    if (minVal != null && val < minVal) return minVal
    if (maxVal != null && val > maxVal) return maxVal
    return val
  }

  // Steppers (mirrors NumberInput for consistency)
  const stepperButtons = (() => {
    if (step == null) return null

    const canDecrement = computedOf(
      value,
      min
    )((val, minVal) => {
      const current = (val as number | null) ?? 0
      if (minVal == null) return true
      return current > (minVal as number)
    })

    const canIncrement = computedOf(
      value,
      max
    )((val, maxVal) => {
      const current = (val as number | null) ?? 0
      if (maxVal == null) return true
      return current < (maxVal as number)
    })

    const handleDecrement = (event?: MouseEvent) => {
      const current = ((Value.get(value) as number | null) ?? 0) as number
      const stepVal = Value.get(step)
      const multiplier = event?.shiftKey ? 10 : 1
      const targetValue = current - stepVal * multiplier
      const minVal = min != null ? Value.get(min) : undefined
      if (minVal != null && targetValue < minVal) return
      const newValue = clampValue(targetValue)
      if (newValue !== current && onChange) onChange(newValue)
    }

    const handleIncrement = (event?: MouseEvent) => {
      const current = ((Value.get(value) as number | null) ?? 0) as number
      const stepVal = Value.get(step)
      const multiplier = event?.shiftKey ? 10 : 1
      const targetValue = current + stepVal * multiplier
      const maxVal = max != null ? Value.get(max) : undefined
      if (maxVal != null && targetValue > maxVal) return
      const newValue = clampValue(targetValue)
      if (newValue !== current && onChange) onChange(newValue)
    }

    const render = (incLabel: string, decLabel: string) =>
      Stack(
        attr.class('bc-number-input-steppers'),
        html.button(
          attr.type('button'),
          attr.class(
            'bc-button bc-number-input-steppers-button bc-number-input-steppers-button--increment'
          ),
          attr.disabled(
            computedOf(
              canIncrement,
              options.disabled ?? false
            )((canInc, disabled) => !canInc || disabled)
          ),
          on.click(event => handleIncrement(event)),
          aria.label(incLabel),
          Icon({ icon: 'line-md:plus', size: 'xs' })
        ),
        html.button(
          attr.type('button'),
          attr.class(
            'bc-button bc-number-input-steppers-button bc-number-input-steppers-button--decrement'
          ),
          attr.disabled(
            computedOf(
              canDecrement,
              options.disabled ?? false
            )((canDec, disabled) => !canDec || disabled)
          ),
          on.click(event => handleDecrement(event)),
          aria.label(decLabel),
          Icon({ icon: 'line-md:minus', size: 'xs' })
        )
      )

    return render(
      defaultMessages.incrementValue,
      defaultMessages.decrementValue
    )
  })()

  const resetAfter = NullableResetAfter(value, options.disabled, onChange)

  const afterContent =
    after != null && stepperButtons != null
      ? Fragment(stepperButtons, resetAfter, after)
      : after != null
        ? Fragment(resetAfter, after)
        : stepperButtons != null
          ? Fragment(stepperButtons, resetAfter)
          : resetAfter

  return InputContainer({
    ...options,
    input: input.number(
      // min/max attributes and reactive watchers (no forced correction)
      min != null ? attr.min(min) : Empty,
      max != null ? attr.max(max) : Empty,
      CommonInputAttributes(options),
      // Represent null as empty string so the field can be cleared
      attr.value(Value.map(value, v => (v == null ? '' : String(v as number)))),
      attr.step(step),
      attr.class('bc-input bc-number-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null
        ? on.change(
            emitValue(v => {
              const next = strToNumberOrNull(v)
              onChange(next as number | null)
            })
          )
        : Empty,
      onInput != null
        ? on.input(
            emitValue(v => {
              const next = strToNumberOrNull(v)
              onInput(next as number | null)
            })
          )
        : Empty,
      // Wheel support when step is defined
      step != null
        ? on.wheel(event => {
            event.preventDefault()
            const current = ((Value.get(value) as number | null) ?? 0) as number
            const stepVal = Value.get(step)
            const multiplier = event.shiftKey ? 10 : 1
            const delta =
              event.deltaY < 0 ? stepVal * multiplier : -stepVal * multiplier
            const newValue = clampValue(current + delta)
            if (newValue !== current && onChange) onChange(newValue)
          })
        : Empty
    ),
    after: afterContent,
  })
}
