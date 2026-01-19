import { defaultMessages } from '../../../beatui-i18n'
import { Icon } from '../../data/icon'
import { aria, attr, computedOf, html, on, TNode, Value } from '@tempots/dom'

// Helper: small reset button shown in InputContainer after slot for nullable values
export function NullableResetAfter<V>(
  value: Value<V | null>,
  disabled?: Value<boolean>,
  onChange?: (v: V | null) => void
): TNode {
  const hasValue = Value.map(value, v => v != null)
  // Button is disabled when there's no value to clear, or when the input itself is disabled
  const isDisabled = computedOf(hasValue, disabled ?? false)((has, dis) => !has || dis)
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
