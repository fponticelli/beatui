import { attr, Empty, html, Value, computedOf, Use } from '@tempots/dom'
import { ThemeColorName } from '../../tokens'
import { ControlSize } from '../theme'
import { CloseButton } from '../button'
import { BeatUII18n } from '../../beatui-i18n'
import {
  backgroundValue,
  hoverBackgroundValue,
  ExtendedColor,
} from '../theme/style-utils'

function generateTagClasses(size: ControlSize, disabled: boolean): string {
  const classes = ['bc-tag']
  if (size !== 'md') {
    classes.push(`bc-tag--${size}`)
  }
  if (disabled) {
    classes.push('bc-tag--disabled')
  }
  return classes.join(' ')
}

function generateTagStyles(color: ExtendedColor): string {
  const baseLight = backgroundValue(color, 'light', 'light')
  const baseDark = backgroundValue(color, 'light', 'dark')
  const hoverLight = hoverBackgroundValue(color, 'light', 'light')
  const hoverDark = hoverBackgroundValue(color, 'light', 'dark')

  return [
    `--tag-bg: ${baseLight.backgroundColor}`,
    `--tag-text: ${baseLight.textColor}`,
    `--tag-bg-dark: ${baseDark.backgroundColor}`,
    `--tag-text-dark: ${baseDark.textColor}`,
    `--tag-bg-hover: ${hoverLight.backgroundColor}`,
    `--tag-text-hover: ${hoverLight.textColor}`,
    `--tag-bg-hover-dark: ${hoverDark.backgroundColor}`,
    `--tag-text-hover-dark: ${hoverDark.textColor}`,
  ].join('; ')
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
        size ?? 'md',
        disabled ?? false
      )((size, disabled) => generateTagClasses(size, disabled))
    ),
    attr.style(
      computedOf(color)(color =>
        generateTagStyles((color ?? 'base') as ExtendedColor)
      )
    ),
    // Allow external classes like bc-tag--disabled to be applied
    attr.class(cls),
    html.span(value),
    onClose != null
      ? Use(BeatUII18n, t =>
          CloseButton(
            {
              size: 'xs',
              label: t.$.removeItem,
              color: 'white',
              disabled,
              onClick: () => onClose?.(Value.get(value)),
            },
            attr.class('bc-tag__close')
          )
        )
      : Empty
  )
}
