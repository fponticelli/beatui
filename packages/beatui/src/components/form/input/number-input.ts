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
  TNode,
  prop,
  When,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { Icon } from '../../data/icon'
import { BeatUII18n } from '../../../beatui-i18n'
import { Locale } from '../../i18n'
import { Stack } from '../../layout'
import { roundToStep } from './step-utils'

/**
 * Configuration options for the {@link NumberInput} component.
 *
 * Extends {@link InputOptions} for numeric values with additional properties for
 * step increment, minimum and maximum bounds. When `step` is provided, stepper
 * buttons and mouse wheel support are automatically enabled.
 */
export type NumberInputOptions = Merge<
  InputOptions<number>,
  {
    /** Step increment for stepper buttons and wheel interactions. When set, enables +/- buttons and scroll-to-step. Hold Shift for 10x multiplier. @default 1 */
    step?: Value<number>
    /** Minimum allowed value. Disables decrement when reached. @default 0 */
    min?: Value<number>
    /** Maximum allowed value. Disables increment when reached. @default 10 */
    max?: Value<number>
    /** Unit of measurement label displayed after the input (e.g., "kg", "px", "%"). Rendered before stepper buttons. */
    unit?: TNode
    /** When true, displays the value formatted with locale-aware grouping and decimals (derived from step) when the input is not focused. @default false */
    formatted?: Value<boolean>
  }
>

/**
 * A numeric input component wrapping a native `<input type="number">` with optional stepper buttons.
 *
 * Renders a styled number field inside an {@link InputContainer} with support for
 * reactive values, min/max constraints, and an optional step increment. When `step`
 * is provided, increment/decrement buttons appear alongside the input, and mouse
 * wheel scrolling adjusts the value. Holding Shift while clicking steppers or
 * scrolling applies a 10x multiplier to the step value.
 *
 * @param options - Configuration options for the number input
 * @returns A styled number input element with optional stepper buttons, wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { NumberInput } from '@tempots/beatui'
 *
 * const quantity = prop(1)
 * NumberInput({
 *   value: quantity,
 *   onChange: v => quantity.set(v),
 *   min: 0,
 *   max: 100,
 *   step: 1,
 *   placeholder: 'Quantity',
 * })
 * ```
 *
 * @example
 * ```ts
 * // Without stepper buttons (no step provided)
 * NumberInput({
 *   value: prop(0),
 *   onChange: (v) => console.log('Value:', v),
 *   min: -10,
 *   max: 10,
 * })
 * ```
 */
/**
 * Derives the number of fraction digits from a step value.
 * e.g., step=1 → 0, step=0.1 → 1, step=0.01 → 2, step=0.5 → 1
 */
function fractionDigitsFromStep(step: number): number {
  if (step >= 1) return 0
  const str = step.toString()
  const dotIndex = str.indexOf('.')
  return dotIndex === -1 ? 0 : str.length - dotIndex - 1
}

export const NumberInput = (options: NumberInputOptions) => {
  const {
    value,
    step,
    min,
    max,
    onBlur,
    onChange,
    onInput,
    after,
    unit,
    formatted,
  } = options

  // Helper function to clamp value within min/max bounds
  const clampValue = (val: number): number => {
    const minVal = min != null ? Value.get(min) : undefined
    const maxVal = max != null ? Value.get(max) : undefined

    if (minVal != null && val < minVal) return minVal
    if (maxVal != null && val > maxVal) return maxVal
    return val
  }

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

          const handleDecrement = (event?: MouseEvent) => {
            const current = Value.get(value) ?? 0
            const stepVal = Value.get(step)
            // Apply 10x multiplier when shift key is held
            const multiplier = event?.shiftKey ? 10 : 1
            const targetValue = roundToStep(
              current - stepVal * multiplier,
              stepVal
            )
            const minVal = min != null ? Value.get(min) : undefined

            // Don't call onChange if we would go below minimum
            if (minVal != null && targetValue < minVal) {
              return
            }

            const newValue = clampValue(targetValue)

            // Only update if value actually changes
            if (newValue !== current) {
              onChange?.(newValue)
              onInput?.(newValue)
            }
          }

          const handleIncrement = (event?: MouseEvent) => {
            const current = Value.get(value) ?? 0
            const stepVal = Value.get(step)
            // Apply 10x multiplier when shift key is held
            const multiplier = event?.shiftKey ? 10 : 1
            const targetValue = roundToStep(
              current + stepVal * multiplier,
              stepVal
            )
            const maxVal = max != null ? Value.get(max) : undefined

            // Don't call onChange if we would go above maximum
            if (maxVal != null && targetValue > maxVal) {
              return
            }

            const newValue = clampValue(targetValue)

            // Only update if value actually changes
            if (newValue !== current) {
              onChange?.(newValue)
              onInput?.(newValue)
            }
          }

          return Stack(
            attr.class('bc-number-input-steppers'),
            // Increment second
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
              aria.label(t.$.incrementValue),
              Icon({ icon: 'line-md:plus', size: 'xs' })
            ),
            // Decrement first (matches tests expecting first button to be decrement)
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
              aria.label(t.$.decrementValue),
              Icon({ icon: 'line-md:minus', size: 'xs' })
            )
          )
        })
      : null

  const unitLabel =
    unit != null ? html.span(attr.class('bc-number-input-unit'), unit) : null

  const afterParts = [unitLabel, stepperButtons, after].filter(
    (p): p is TNode => p != null
  )
  const afterContent =
    afterParts.length > 1
      ? Fragment(...afterParts)
      : afterParts.length === 1
        ? afterParts[0]
        : undefined

  const useFormatted = formatted != null && Value.get(formatted)
  const focused = useFormatted ? prop(false) : null

  const numberInput = input.number(
    min != null ? attr.min(min) : Empty,
    max != null ? attr.max(max) : Empty,
    CommonInputAttributes(options),
    attr.valueAsNumber(value),
    attr.step(step),
    attr.class('bc-input bc-number-input'),
    focused != null
      ? attr.class(
          computedOf(
            focused,
            formatted ?? false
          )((f, fmt): string => (fmt && !f ? 'bc-number-input--hidden' : ''))
        )
      : Empty,
    on.focus(() => focused?.set(true)),
    on.blur(() => {
      focused?.set(false)
      onBlur?.()
    }),
    onBlur != null && focused == null ? on.blur(emitValue(onBlur)) : Empty,
    onChange != null ? on.change(emitValueAsNumber(onChange)) : Empty,
    onInput != null ? on.input(emitValueAsNumber(onInput)) : Empty,
    // Add wheel event support when step is defined
    step != null
      ? on.wheel(event => {
          event.preventDefault()
          const current = Value.get(value) ?? 0
          const stepVal = Value.get(step)
          // Apply 10x multiplier when shift key is held
          const multiplier = event.shiftKey ? 10 : 1
          const delta =
            event.deltaY < 0 ? stepVal * multiplier : -stepVal * multiplier
          const newValue = clampValue(roundToStep(current + delta, stepVal))

          // Only update if value actually changes
          if (newValue !== current) {
            onChange?.(newValue)
            onInput?.(newValue)
          }
        })
      : Empty
  )

  const formattedOverlay =
    focused != null
      ? Use(Locale, ({ locale }) => {
          const showOverlay = computedOf(
            focused,
            formatted ?? false
          )((f, fmt) => fmt && !f)

          const formattedText = computedOf(
            value,
            locale,
            step
          )((val, loc, s) => {
            if (val == null || isNaN(val)) return ''
            const digits = s != null ? fractionDigitsFromStep(s) : undefined
            try {
              return new Intl.NumberFormat(loc, {
                minimumFractionDigits: digits,
                maximumFractionDigits: digits,
              }).format(val)
            } catch {
              return String(val)
            }
          })

          return When(showOverlay, () =>
            html.span(attr.class('bc-number-input-formatted'), formattedText)
          )
        })
      : null

  const inputContent =
    formattedOverlay != null
      ? Fragment(numberInput, formattedOverlay)
      : numberInput

  return InputContainer({
    ...options,
    input: inputContent,
    after: afterContent,
  })
}
