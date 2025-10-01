import { defaultMessages } from '@/beatui-i18n'
import { Icon } from '@/components/data/icon'
import { aria, attr, html, on, TNode, Value, When } from '@tempots/dom'

// Helper: small reset button shown in InputContainer after slot for nullable values
export function NullableResetAfter<V>(
  value: Value<V | null>,
  disabled?: Value<boolean>,
  onChange?: (v: V | null) => void
): TNode {
  const hasValue = Value.map(value, v => v != null)
  const label = defaultMessages.clearValue

  return When(hasValue, () =>
    html.button(
      attr.type('button'),
      attr.class('bc-input-container__reset'),
      aria.label(label),
      attr.title(label),
      attr.disabled(disabled ?? false),
      Icon({ icon: 'mdi:close', size: 'sm' }),
      on.click((e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        onChange?.(null)
      })
    )
  )
}
