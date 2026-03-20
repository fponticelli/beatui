import {
  aria,
  attr,
  computedOf,
  Empty,
  html,
  on,
  TNode,
  Use,
  Value,
} from '@tempots/dom'
import { ControlSize } from '../../theme'
import { ThemeColorName } from '../../../tokens'
import { Icon } from '../../data/icon'
import { BeatUII18n } from '../../../beatui-i18n'

/** Orientation of the stepper layout. */
export type NumberStepperOrientation = 'horizontal' | 'vertical'

/** Configuration options for the {@link NumberStepper} component. */
export interface NumberStepperOptions {
  /** The current numeric value. */
  value: Value<number>
  /** Callback invoked when the value changes. */
  onChange: (value: number) => void
  /** Minimum allowed value. @default 0 */
  min?: Value<number>
  /** Maximum allowed value. @default 100 */
  max?: Value<number>
  /** Increment/decrement step. @default 1 */
  step?: Value<number>
  /** Size of the stepper. @default 'md' */
  size?: Value<ControlSize>
  /** Theme color. @default 'base' */
  color?: Value<ThemeColorName>
  /** Whether the stepper is disabled. @default false */
  disabled?: Value<boolean>
  /** Layout orientation. @default 'horizontal' */
  orientation?: Value<NumberStepperOrientation>
}

function generateNumberStepperClasses(
  size: ControlSize,
  disabled: boolean,
  orientation: string
): string {
  const cls = [
    'bc-number-stepper',
    `bc-number-stepper--size-${size}`,
    `bc-number-stepper--${orientation}`,
  ]
  if (disabled) cls.push('bc-number-stepper--disabled')
  return cls.join(' ')
}

/**
 * A quantity selector with compact +/- buttons and a displayed value.
 *
 * Unlike {@link NumberInput}, this component does not include a text field —
 * it shows the current value between decrement and increment buttons. Ideal
 * for cart quantities, counters, and other discrete value adjustments.
 *
 * Supports both horizontal (default) and vertical orientation.
 *
 * @param options - Configuration for the number stepper
 * @returns A number stepper element
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { NumberStepper } from '@tempots/beatui'
 *
 * const qty = prop(1)
 * NumberStepper({
 *   value: qty,
 *   onChange: qty.set,
 *   min: 0,
 *   max: 99,
 * })
 * ```
 */
export function NumberStepper(options: NumberStepperOptions): TNode {
  const {
    value,
    onChange,
    min,
    max,
    step = 1,
    size = 'md',
    disabled = false,
    orientation = 'horizontal',
  } = options

  return Use(BeatUII18n, t => {
    const canDecrement = computedOf(
      value,
      disabled
    )((v, dis) => {
      if (dis) return false
      const minVal = min != null ? Value.get(min) : undefined
      if (minVal != null) return v > minVal
      return true
    })

    const canIncrement = computedOf(
      value,
      disabled
    )((v, dis) => {
      if (dis) return false
      const maxVal = max != null ? Value.get(max) : undefined
      if (maxVal != null) return v < maxVal
      return true
    })

    const handleDecrement = () => {
      if (Value.get(disabled)) return
      const current = Value.get(value)
      const stepVal = Value.get(step)
      const minVal = min != null ? Value.get(min) : undefined
      const newVal = current - stepVal
      if (minVal != null && newVal < minVal) return
      onChange(newVal)
    }

    const handleIncrement = () => {
      if (Value.get(disabled)) return
      const current = Value.get(value)
      const stepVal = Value.get(step)
      const maxVal = max != null ? Value.get(max) : undefined
      const newVal = current + stepVal
      if (maxVal != null && newVal > maxVal) return
      onChange(newVal)
    }

    // Use a smaller icon size than the component size
    const iconSize = Value.map(size, (s): ControlSize => {
      switch (s) {
        case 'xs':
          return 'xs'
        case 'sm':
          return 'xs'
        case 'md':
          return 'sm'
        case 'lg':
          return 'sm'
        case 'xl':
          return 'md'
        default:
          return 'sm'
      }
    })

    const makeButton = (
      label: Value<string>,
      icon: string,
      canAct: Value<boolean>,
      handler: () => void,
      modifier: 'increment' | 'decrement'
    ) =>
      html.button(
        attr.type('button'),
        attr.class(`bc-number-stepper__button bc-number-stepper__button--${modifier}`),
        attr.disabled(Value.map(canAct, c => !c)),
        aria.label(label),
        on.click(e => {
          e.stopPropagation()
          handler()
        }),
        Icon({ icon, size: iconSize })
      )

    return html.div(
      attr.class(
        computedOf(size, disabled, orientation)(generateNumberStepperClasses)
      ),
      attr.role('group'),
      aria.label(t.$.numberStepper.$.value),
      min != null ? aria.valuemin(min) : Empty,
      max != null ? aria.valuemax(max) : Empty,
      aria.valuenow(value),
      // Decrement button
      makeButton(
        t.$.numberStepper.$.decrement,
        'lucide:minus',
        canDecrement,
        handleDecrement,
        'decrement'
      ),
      // Value display
      html.span(
        attr.class('bc-number-stepper__value'),
        aria.live('polite'),
        Value.map(value, String)
      ),
      // Increment button
      makeButton(
        t.$.numberStepper.$.increment,
        'lucide:plus',
        canIncrement,
        handleIncrement,
        'increment'
      )
    )
  })
}
