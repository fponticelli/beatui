import { attr, Empty, html, on, Value, computedOf } from '@tempots/dom'
import { changeFontSize, ThemeColorName } from '../../tokens'
import { ControlSize } from '../theme'

const mapPX = {
  xs: '1.5',
  sm: '2',
  md: '2.5',
  lg: '3',
  xl: '4',
}

const mapPY = {
  xs: '0',
  sm: '0',
  md: '0',
  lg: '0.25',
  xl: '0.5',
}

function generateTagClasses(
  disabled: boolean,
  color: string,
  size: ControlSize
): string {
  const classes = ['bc-tag']

  if (disabled) {
    classes.push('bc-tag--disabled')
  } else {
    classes.push(`bu-bg--${color}`)
  }

  classes.push(
    `bu-text-${changeFontSize(size, -1)} bu-px-${mapPX[size]} bu-py-${mapPY[size]}`
  )

  return classes.join(' ')
}

export const Tag = ({
  disabled,
  value,
  color = 'base',
  onClose,
  size = 'md',
}: {
  value: Value<string>
  disabled?: Value<boolean>
  color?: Value<ThemeColorName>
  onClose?: (value: string) => void
  size?: Value<ControlSize>
}) => {
  return html.span(
    attr.class(
      computedOf(
        disabled ?? false,
        color ?? 'base',
        size ?? 'md'
      )((disabled, color, size) => generateTagClasses(disabled, color, size))
    ),
    html.span(value),
    onClose != null
      ? html.button(
          attr.disabled(disabled),
          attr.class('bc-tag__close'),
          html.span('×'),
          on.click(() => onClose?.(Value.get(value)))
        )
      : Empty
  )
}
