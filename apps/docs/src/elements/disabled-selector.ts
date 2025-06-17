import { Switch } from '@tempots/beatui'
import { Prop } from '@tempots/dom'

export function DisabledSelector({ disabled }: { disabled: Prop<boolean> }) {
  return Switch({
    label: 'Disabled',
    value: disabled,
    onChange: disabled.set,
  })
}
