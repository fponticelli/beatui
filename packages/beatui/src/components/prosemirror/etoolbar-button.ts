import { attr, Signal, Value, When } from '@tempots/dom'
import { ButtonVariant, ControlSize } from '../theme'
import { ToolbarButton } from '../navigation'
import { Icon } from '../data'

export function EToolbarButton({
  active,
  display,
  onClick,
  disabled,
  label,
  icon,
  size,
}: {
  active: Signal<boolean>
  display: Signal<boolean>
  onClick: () => void
  disabled: Signal<boolean>
  label: Value<string>
  icon: Value<string>
  size: Value<ControlSize>
}) {
  return When(display, () =>
    ToolbarButton(
      {
        onClick,
        disabled,
        variant: active.map(v => (v ? 'filled' : 'light') as ButtonVariant),
        size,
      },
      attr.title(label),
      Icon({ icon, size })
    )
  )
}
