import {
  attr,
  emitValue,
  Empty,
  input,
  on,
  Value,
  computedOf,
  aria,
  Use,
  html,
  Fragment,
  OnDispose,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { Icon } from '../../data/icon'
import { BeatUII18n } from '@/beatui-i18n'
import { Stack } from '@/components/layout'

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
  const stepperButtons =
    step != null
      ? Use(BeatUII18n, t => {
          const canDecrement = computedOf(value, min)((val, minVal) => {
            const current = (val as number | null) ?? 0
            if (minVal == null) return true
            return current > (minVal as number)
          })

          const canIncrement = computedOf(value, max)((val, maxVal) => {
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

          return Stack(
            attr.class('bc-number-input-steppers'),
            html.button(
              attr.class(
                'bc-button bc-number-input-steppers-button bc-number-input-steppers-button--increment'
              ),
              attr.disabled(
                computedOf(canIncrement, options.disabled ?? false)(
                  (canInc, disabled) => !canInc || disabled
                )
              ),
              on.click(event => handleIncrement(event)),
              aria.label(t.$.incrementValue),
              Icon({ icon: 'line-md:plus', size: 'xs' })
            ),
            html.button(
              attr.class(
                'bc-button bc-number-input-steppers-button bc-number-input-steppers-button--decrement'
              ),
              attr.disabled(
                computedOf(canDecrement, options.disabled ?? false)(
                  (canDec, disabled) => !canDec || disabled
                )
              ),
              on.click(event => handleDecrement(event)),
              aria.label(t.$.decrementValue),
              Icon({ icon: 'line-md:minus', size: 'xs' })
            )
          )
        })
      : null

  const afterContent =
    after != null && stepperButtons != null
      ? Fragment(stepperButtons, after)
      : after ?? stepperButtons

  return InputContainer({
    ...options,
    input: input.number(
      // min/max attributes and reactive watchers (no forced correction)
      min != null
        ? Fragment(
            attr.min(min),
            OnDispose(
              Value.on(min, _ => {
                // No-op: we avoid forcing changes here for null-friendly UX
              })
            )
          )
        : Empty,
      max != null
        ? Fragment(
            attr.max(max),
            OnDispose(
              Value.on(max, _ => {
                // No-op: we avoid forcing changes here for null-friendly UX
              })
            )
          )
        : Empty,
      CommonInputAttributes(options),
      // Represent null as empty string so the field can be cleared
      attr.value(
        Value.map(value, v => (v == null ? '' : String(v as number)))
      ),
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
            const delta = event.deltaY < 0 ? stepVal * multiplier : -stepVal * multiplier
            const newValue = clampValue(current + delta)
            if (newValue !== current && onChange) onChange(newValue)
          })
        : Empty
    ),
    after: afterContent,
  })
}

