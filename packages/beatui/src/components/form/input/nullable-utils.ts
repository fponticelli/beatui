import { defaultMessages } from '../../../beatui-i18n'
import { Icon } from '../../data/icon'
import { aria, attr, computedOf, html, on, Value } from '@tempots/dom'

/**
 * Creates a small reset (clear) button for nullable input fields.
 *
 * The button is rendered in the `after` slot of an `InputContainer` and allows
 * users to clear the current value back to `null`. It is automatically disabled
 * when the value is already `null` or the input is disabled.
 *
 * @typeParam V - The non-null value type of the input.
 * @param value - Reactive value that may be `V` or `null`.
 * @param disabled - Optional reactive boolean indicating whether the input is disabled.
 * @param onChange - Optional callback invoked with `null` when the reset button is clicked.
 * @returns A DOM node representing the reset button.
 *
 * @example
 * ```ts
 * const resetAfter = NullableResetAfter(value, disabled, onChange)
 * // Use in InputContainer:
 * InputContainer({ ...options, after: resetAfter })
 * ```
 */
export function NullableResetAfter<V>(
  value: Value<V | null>,
  disabled?: Value<boolean>,
  onChange?: (v: V | null) => void
) {
  const hasValue = Value.map(value, v => v != null)
  // Button is disabled when there's no value to clear, or when the input itself is disabled
  const isDisabled = computedOf(
    hasValue,
    disabled ?? false
  )((has, dis) => !has || dis)
  const label = defaultMessages.clearValue

  return html.button(
    attr.type('button'),
    attr.class('bc-input-container__reset'),
    aria.label(label),
    attr.title(label),
    attr.disabled(isDisabled),
    Icon({ icon: 'mdi:close', size: 'sm' }),
    on.click((e: Event) => {
      e.stopPropagation()
      onChange?.(null)
    })
  )
}
