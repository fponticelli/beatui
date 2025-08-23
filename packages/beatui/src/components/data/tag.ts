import { attr, Empty, html, on, Value, computedOf, Unless } from '@tempots/dom'
import { ThemeColorName } from '../../tokens'
import { ControlSize } from '../theme'
import { Icon } from './icon'

function generateTagClasses(
  color: string,
  size: ControlSize,
  disabled: boolean
): string {
  const classes = ['bc-tag']
  classes.push(`bu-bg-${color}`)
  if (size !== 'md') {
    classes.push(`bc-tag--${size}`)
  }
  if (disabled) {
    classes.push('bc-tag--disabled')
  }
  return classes.join(' ')
}

export const Tag = ({
  value,
  color = 'base',
  onClose,
  size = 'md',
  class: cls,
  disabled,
}: {
  value: Value<string>
  color?: Value<ThemeColorName>
  onClose?: (value: string) => void
  size?: Value<ControlSize>
  class?: Value<string>
  disabled?: Value<boolean>
}) => {
  return html.span(
    attr.class(
      computedOf(
        color ?? 'base',
        size ?? 'md',
        disabled ?? false
      )((color, size, disabled) => generateTagClasses(color, size, disabled))
    ),
    // Allow external classes like bc-tag--disabled to be applied
    attr.class(cls),
    html.span(value),
    onClose != null
      ? html.button(
          attr.class('bc-tag__close'),
          Icon({ icon: 'line-md:close', size: 'xs' }),
          Unless(disabled ?? false, () =>
            on.click(() => onClose?.(Value.get(value)))
          )
        )
      : Empty
  )
}
