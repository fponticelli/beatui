import {
  TNode,
  Value,
  attr,
  html,
  on,
  computedOf,
  aria,
  ForEach,
} from '@tempots/dom'
import { ControlSize } from '../../theme'
import { sessionId } from '../../../utils/session-id'

/**
 * Configuration for a single radio option within a {@link RadioGroup}.
 *
 * @template V - The type of the option's value
 */
export interface RadioOption<V = string> {
  /** The value associated with this radio option */
  value: V
  /** Display label for the radio option */
  label: string
  /** Optional description text displayed below the label */
  description?: string
  /** Whether this specific option is disabled */
  disabled?: boolean
}

/**
 * Configuration options for the {@link RadioGroup} component.
 *
 * @template V - The type of the radio values (defaults to string)
 */
export interface RadioGroupOptions<V = string> {
  /** Array of radio options to render */
  options: Value<RadioOption<V>[]>
  /** The currently selected value */
  value: Value<V>
  /** Callback invoked when a different option is selected */
  onChange?: (value: V) => void
  /** HTML name attribute for the radio group (generated if not provided) */
  name?: string
  /** Whether the entire radio group is disabled */
  disabled?: Value<boolean>
  /**
   * Layout orientation of the radio options.
   * @default 'vertical'
   */
  orientation?: Value<'horizontal' | 'vertical'>
  /**
   * Visual size of the radio controls.
   * @default 'md'
   */
  size?: Value<ControlSize>
  /**
   * Additional CSS class name(s) to apply to the root element.
   */
  class?: Value<string>
}

function generateRadioGroupClasses(
  orientation: 'horizontal' | 'vertical',
  extra?: string
) {
  const classes = ['bc-radio-group', `bc-radio-group--${orientation}`]
  if (extra && extra.length > 0) classes.push(extra)
  return classes.join(' ')
}

function generateRadioItemClasses(
  size: ControlSize,
  disabled: boolean,
  groupDisabled: boolean
) {
  const classes = ['bc-radio-group__item', `bc-radio-group__item--size-${size}`]
  if (disabled || groupDisabled) {
    classes.push('bc-radio-group__item--disabled')
  }
  return classes.join(' ')
}

/**
 * Renders a group of radio buttons allowing the user to select one option from
 * a list of mutually exclusive choices.
 *
 * Uses native `<input type="radio">` elements for proper form integration and
 * accessibility, but applies custom styling via CSS. Each option can have a
 * label and optional description text. The radio group supports both horizontal
 * and vertical layouts, multiple size variants, and individual or group-wide
 * disabled states.
 *
 * @template V - The type of values for the radio options
 * @param options - Configuration options for the radio group
 * @returns A styled radio group element with native radio inputs
 *
 * @example
 * ```typescript
 * import { prop } from '@tempots/dom'
 * import { RadioGroup } from '@tempots/beatui'
 *
 * const theme = prop<'light' | 'dark'>('light')
 * RadioGroup({
 *   options: [
 *     { value: 'light', label: 'Light Mode' },
 *     { value: 'dark', label: 'Dark Mode' },
 *   ],
 *   value: theme,
 *   onChange: theme.set,
 *   orientation: 'horizontal'
 * })
 * ```
 *
 * @example
 * ```typescript
 * // With descriptions and disabled option
 * RadioGroup({
 *   options: [
 *     {
 *       value: 'basic',
 *       label: 'Basic Plan',
 *       description: '$10/month - Essential features'
 *     },
 *     {
 *       value: 'pro',
 *       label: 'Pro Plan',
 *       description: '$30/month - Advanced features'
 *     },
 *     {
 *       value: 'enterprise',
 *       label: 'Enterprise',
 *       description: 'Contact sales',
 *       disabled: true
 *     }
 *   ],
 *   value: prop('basic'),
 *   onChange: (v) => console.log('Selected:', v),
 *   size: 'lg'
 * })
 * ```
 */
export function RadioGroup<V = string>({
  options,
  value,
  onChange,
  name,
  disabled = false,
  orientation = 'vertical',
  size = 'md',
  class: cls,
}: RadioGroupOptions<V>): TNode {
  // Generate a unique name if not provided
  const groupName = name ?? sessionId('radio-group')

  return html.div(
    attr.class(
      computedOf(
        orientation,
        cls
      )((orient, extra) =>
        generateRadioGroupClasses(orient ?? 'vertical', extra)
      )
    ),
    attr.role('radiogroup'),
    // Render each radio option
    ForEach(options, optionSignal => {
      const optionDisabled = optionSignal.map(o => o.disabled ?? false)
      const inputId = sessionId('radio')

      return html.label(
        attr.class(
          computedOf(
            size,
            disabled,
            optionDisabled
          )((sz, groupDis, optDis) =>
            generateRadioItemClasses(
              sz ?? 'md',
              optDis ?? false,
              groupDis ?? false
            )
          )
        ),
        // Native radio input (visually hidden)
        html.input(
          attr.type('radio'),
          attr.name(groupName),
          attr.id(inputId),
          attr.value(optionSignal.map(o => String(o.value))),
          attr.class('bc-radio-group__input'),
          attr.checked(
            computedOf(value, optionSignal)((v, o) => v === o.value)
          ),
          attr.disabled(
            computedOf(
              disabled,
              optionDisabled
            )((d, optDis) => (d ?? false) || (optDis ?? false))
          ),
          on.change(() => {
            const isDisabled =
              Value.get(disabled) || (Value.get(optionSignal).disabled ?? false)
            if (!isDisabled) {
              onChange?.(Value.get(optionSignal).value)
            }
          }),
          aria.disabled(
            computedOf(
              disabled,
              optionDisabled
            )((d, optDis) => (d ?? false) || (optDis ?? false))
          )
        ),
        // Custom radio indicator
        html.span(attr.class('bc-radio-group__indicator')),
        // Label and description
        html.span(
          attr.class('bc-radio-group__label-container'),
          html.span(
            attr.class('bc-radio-group__label'),
            optionSignal.map(o => o.label)
          ),
          html.span(
            attr.class('bc-radio-group__description'),
            optionSignal.map(o => o.description ?? '')
          )
        )
      )
    })
  )
}
