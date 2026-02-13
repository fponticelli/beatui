import {
  attr,
  Value,
  computedOf,
  aria,
  Use,
  html,
  Fragment,
  on,
} from '@tempots/dom'
import { Merge } from '@tempots/std'
import { BeatUII18n } from '../../../beatui-i18n'
import { Stack } from '../../layout'
import { Icon } from '../../data/icon'
import { MaskInput } from './mask-input'
import { InputOptions } from './input-options'

/**
 * Options for the {@link BigintInput} component.
 * Extends standard `InputOptions` for `bigint` values with stepper and range constraints.
 */
export type BigintInputOptions = Merge<
  InputOptions<bigint>,
  {
    /** Step value for increment/decrement buttons. If provided, stepper buttons are shown. */
    step?: Value<bigint>
    /** Minimum allowed value. Values below this are clamped. */
    min?: Value<bigint>
    /** Maximum allowed value. Values above this are clamped. */
    max?: Value<bigint>
  }
>

const toBigint = (v: string): bigint | null => {
  try {
    return BigInt(v)
  } catch {
    return null
  }
}

/**
 * A numeric input component for `bigint` values with optional stepper buttons.
 *
 * Uses a masked input that only allows digit characters. Supports min/max
 * clamping and increment/decrement buttons (with Shift+click for 10x step).
 *
 * @param options - Configuration options for the bigint input.
 * @returns A renderable bigint input component.
 *
 * @example
 * ```ts
 * BigintInput({
 *   value: prop(0n),
 *   step: 1n,
 *   min: 0n,
 *   max: 1000n,
 *   onChange: v => console.log('Value:', v),
 * })
 * ```
 */
export const BigintInput = (options: BigintInputOptions) => {
  const { value, step, min, max, onChange, onInput, after } = options

  const clampValue = (val: bigint): bigint => {
    const minVal = min != null ? Value.get(min) : undefined
    const maxVal = max != null ? Value.get(max) : undefined
    if (minVal != null && val < minVal) return minVal
    if (maxVal != null && val > maxVal) return maxVal
    return val
  }

  const stepperButtons =
    step != null
      ? Use(BeatUII18n, t => {
          const canDecrement = computedOf(
            value,
            min
          )((val, minVal) => {
            if (minVal == null) return true
            return (val ?? 0n) > minVal
          })

          const canIncrement = computedOf(
            value,
            max
          )((val, maxVal) => {
            if (maxVal == null) return true
            return (val ?? 0n) < maxVal
          })

          const handle = (delta: bigint, event?: MouseEvent) => {
            const current = Value.get(value) ?? 0n
            const stepVal = Value.get(step)
            const multiplier = event?.shiftKey ? 10n : 1n
            const target = current + stepVal * multiplier * delta
            const minVal = min != null ? Value.get(min) : undefined
            const maxVal = max != null ? Value.get(max) : undefined
            if (delta < 0n && minVal != null && target < minVal) return
            if (delta > 0n && maxVal != null && target > maxVal) return
            const newValue = clampValue(target)
            if (newValue !== current && onChange) onChange(newValue)
          }

          return Stack(
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
                )((c, d) => !c || d)
              ),
              on.click(ev => handle(1n, ev)),
              aria.label(t.$.incrementValue),
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
                )((c, d) => !c || d)
              ),
              on.click(ev => handle(-1n, ev)),
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

  const handleChange = onChange
    ? (s: string) => {
        const parsed = toBigint(s)
        if (parsed != null) onChange(clampValue(parsed))
      }
    : undefined

  const handleInput = onInput
    ? (s: string) => {
        const parsed = toBigint(s)
        if (parsed != null) onInput(clampValue(parsed))
      }
    : undefined

  return MaskInput({
    ...options,
    value: Value.map(value, v => v.toString()),
    onChange: handleChange,
    onInput: handleInput,
    after: afterContent,
    mask: null,
    allowMode: 'digits',
    class: 'bc-number-input',
  })
}
